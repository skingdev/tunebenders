var define, requireModule;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod = registry[name];

    if (!mod) {
      throw new Error("Module: '" + name + "' not found.");
    }

    var deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };

  define.registry = registry;
  define.seen = seen;
})();

define("resolver",
  [],
  function() {
    "use strict";
  /*
   * This module defines a subclass of Ember.DefaultResolver that adds two
   * important features:
   *
   *  1) The resolver makes the container aware of es6 modules via the AMD
   *     output. The loader's registry is consulted so that classes can be 
   *     resolved directly via the module loader, without needing a manual
   *     `import`.
   *  2) is able provide injections to classes that implement `extend`
   *     (as is typical with Ember).
   */

  function classFactory(klass) {
    return {
      create: function (injections) {
        if (typeof klass.extend === 'function') {
          return klass.extend(injections);  
        } else {
          return klass;
        }
      }
    };
  }

    var dasherize = Ember.String.dasherize;

    function loadModule(name){
      var module = requireModule(name);

      if (typeof module.create !== "function") {
        module = classFactory(module);
      }

      if (Ember.ENV.LOG_MODULE_RESOLVER){
        Ember.logger.info("hit", name);
      }

      return module;
    }

    function basicGenerator(prefix, name, type) {
      return prefix + "/" +  dasherize(name) + "/" + type;
    }

    function nameParts(name, options) {
      options = options || {};
      var delimiterRegex = /([A-Z]*[a-z]*[a-z])([A-Z][a-z]*)/;
      var parts = name.split(delimiterRegex);

      if(options.lastPart) {
        var lastPart = parts.pop();
        return [parts.join(""), lastPart];
      }

      parts = parts.map(function(part){ return part.toLowerCase(); });
      parts = parts.filter(function(part){ return part !== ""; });
      return parts;
    }

    function nestedMainDasherizedGenerator(prefix, name, type) {
      var pluralizedType = type + "s";
      name = dasherize(name);

      return prefix + "/" + name + "/" + pluralizedType + "/main";
    }

    function nestedDasherizedGenerator(prefix, name, type) {
      var pluralizedType = type + "s";
      var parts = nameParts(name, {lastOnly: true});
      var lastPart = parts.pop();
      if(parts.length > 0) {
        name = dasherize(parts[0]);
      }

      return prefix + "/" + name + "/" + pluralizedType + "/" + lastPart;
    }

    function nestedGenerator(prefix, name, type) {
      var pluralizedType = type + "s";
      var parts = nameParts(name);
      var lastPart = parts.pop();
      name = parts.join("/");

      return prefix + "/" + name + "/" + pluralizedType + "/" + lastPart;
    }

    function nestedMainGenerator(prefix, name, type){
      var pluralizedType = type + "s";
      var parts = nameParts(name);
      name = parts.join("/");

      return prefix + "/" + name + "/" + pluralizedType + "/main";
    }

    function loadTemplateWithName(name){
      var parts = nameParts(name);
      var tries = [parts.join("/") + "/main", parts.join("/")];
      return tries.reduce(function(template, name){
        return template || Ember.TEMPLATES[name];
      }, null);
    }

    function loadModuleWithName(prefix, name, type){
      var generators = [basicGenerator.bind(null, prefix, name, type),
        nestedGenerator.bind(null, prefix, name, type),
        nestedMainGenerator.bind(null, prefix, name, type),
        nestedDasherizedGenerator.bind(null, prefix, name, type),
        nestedMainDasherizedGenerator.bind(null, prefix, name, type)
      ];
      return tryModuleName(generators.shift(), generators);
    }

    function tryModuleName(generator, generators) {
      var moduleName = generator.apply(null);

      // console.log("looking up: ", moduleName);
      if(define.registry[moduleName]) {
        return requireModule(moduleName);
      } else if(generators.length > 0){
        return tryModuleName(generators.shift(), generators);
      }
    }

    function resolveTemplate(parsedName){
      var template = loadTemplateWithName(parsedName.name);

      if(template) {
        return template;
      } else  {
        return this._super(parsedName);
      }
    }

    function resolveOther(parsedName) {
      var prefix = this.namespace.modulePrefix;
      Ember.assert("module prefix must be defined", prefix);

      var name = parsedName.fullNameWithoutType;

      var module = loadModuleWithName(prefix, name, parsedName.type);
      if(module) {

        if (typeof module.create !== "function") {
          module = classFactory(module);
        }

        return module;

      } else  {
        return this._super(parsedName);
      }
    }

    // Ember.DefaultResolver docs:
    //   https://github.com/emberjs/ember.js/blob/master/packages/ember-application/lib/system/resolver.js
    var Resolver = Ember.DefaultResolver.extend({
      resolveOther: resolveOther,
      resolveTemplate: resolveTemplate
    });

    return Resolver;
  });
