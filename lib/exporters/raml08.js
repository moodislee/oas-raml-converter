const _ = require('lodash'),
	RAMLExporter = require('./baseraml'),
	jsonHelper = require('../utils/json');

class RAML08Exporter extends RAMLExporter {
	constructor() {
		super();
	}
	
	version() {
		return '0.8';
	}
	
	mapMediaType(consumes, produces) {
		let mediaTypes = [];
		if (consumes && consumes.length > 0) {
			mediaTypes = consumes;
		}
		
		if (_.isArray(produces)) {
			mediaTypes = mediaTypes.concat(produces);
		}
		mediaTypes = _.uniq(mediaTypes);
		
		return mediaTypes.length ? mediaTypes[0] : null;
	}
	
	mapAuthorizationGrants(flow) {
		let ag = [];
		switch (flow) {
			case 'implicit':
				ag = ['token'];
				break;
			case 'password':
				ag = ['credentials'];
				break;
			case 'application':
				ag = ['owner'];
				break;
			case 'accessCode':
				ag = ['code'];
				break;
		}
		return ag;
	}
	
	mapRequestBodyForm(bodyData) {
		let body = {
			formParameters: bodyData.properties
		};
		if (bodyData.required && bodyData.required.length > 0) {
			for (let i in bodyData.required) {
				if (!bodyData.required.hasOwnProperty(i)) continue;
				let requiredParam = bodyData.required[i];
				if (body['formParameters'][requiredParam]) {
					body['formParameters'][requiredParam].required = true;
				}
			}
		}
		
		return body;
	}
	
	mapBody(bodyData) {
		let body = {
			schema: jsonHelper.format(this.convertRefFromModel(jsonHelper.parse(bodyData.body), false))
		};
		
		let example = jsonHelper.format(bodyData.example);
		if (!_.isEmpty(example)) {
			body.example = example;
		}
		
		return body;
	}
	
	addSchema(ramlDef, schema) {
		ramlDef.schemas = schema;
	}
	
	mapSchema(slSchemas) {
		let results = [];
		for (let i in slSchemas) {
			if (!slSchemas.hasOwnProperty(i)) continue;
			let schema = slSchemas[i];
			let resultSchema = {};
			resultSchema[schema.NameSpace] = jsonHelper.format(schema.Definition);
			results.push(resultSchema);
		}
		return results;
	}
	
	description(ramlDef, project) {
		ramlDef.documentation = [{
			title: project.Name,
			content: project.Description
		}];
	}
	
	getApiKeyType() {
		return 'x-api-key';
	}
	
	mapSecuritySchemes(securitySchemes) {
		return _.map(securitySchemes, function (v, k) {
			let m = {};
			m[k] = v;
			return m;
		});
	}
	
	setMethodDisplayName() {
	}
	
	initializeTraits() {
		return [];
	}
	
	addTrait(id, trait, traits) {
		let newTrait = {};
		newTrait[_.camelCase(id)] = trait;
		traits.push(newTrait);
	}
}

module.exports = RAML08Exporter;
