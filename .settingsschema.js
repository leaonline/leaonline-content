const SimpleSchema = require('simpl-schema')
const oauthFlows = ['authorization_code']
const schema = def => new SimpleSchema(def)

const urlField = {
  type: String,
  regEx: SimpleSchema.RegEx.url
}

const settingsSchema = schema({
  cors: Boolean,
  jwt: schema({
    key: String
  }),
  oauth: schema({
    clientId: String,
    secret: String,
    dialogUrl:  urlField,
    accessTokenUrl:  urlField,
    authorizeUrl:  urlField,
    identityUrl:  urlField,
    redirectUrl:  urlField
  }),
  hashing: schema({
    algorithm: String,
    digest: String
  }),
  hosts: schema({
    otulea: schema({
      url:  urlField,
      sub: String
    }),
    backend: schema({
      url:  urlField,
      urlRegEx: schema({
        regex: String
      })
    }),
    teacher: schema({
      url:  urlField,
      secret: String,
      expires: SimpleSchema.Integer,
      sub: String
    }),
    appbackend: schema({
      url: urlField,
      sub: String
    })
  }),
  files: schema({
    bucketName: String,
    maxSize: SimpleSchema.Integer
  }),
  tts: schema({
    maxChars: SimpleSchema.Integer,
    allowedOrigins: Array,
    'allowedOrigins.$': urlField
  }),
  competencies: schema({
    url: String
  }),
  patches: schema({
    clozeScoringSchema: Boolean,
    recomputeProgress: Boolean,
    linkAlphaLevel: Boolean
  }),
  status: schema({
    active: Boolean,
    interval: SimpleSchema.Integer,
    secret: String,
    url: urlField
  }),
  email: schema({
    appName: String,
    from: String,
    notify: [String],
    replyTo: String
  }),
  rateLimit: schema({
    methods: schema({
      get: [SimpleSchema.Integer],
      all: [SimpleSchema.Integer],
      insert: [SimpleSchema.Integer],
      update: [SimpleSchema.Integer],
      remove: [SimpleSchema.Integer],
    })
  }),
  public: Object
})

module.exports = function (settings) {
  settingsSchema.validate(settings)
}
