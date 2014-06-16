var
  chai = require('chai'),
  sinonChai = require('sinon-chai')

chai
  .use(sinonChai)
  .use(chai.should)
  .should()
