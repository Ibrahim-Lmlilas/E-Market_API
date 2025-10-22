const { expect } = require('chai');

describe('Simple Tests', function () {
  it('should pass basic assertion', function () {
    expect(1 + 1).to.equal(2);
  });

  it('should verify string operations', function () {
    const str = 'Hello World';
    expect(str).to.be.a('string');
    expect(str).to.include('Hello');
  });

  it('should verify array operations', function () {
    const arr = [1, 2, 3];
    expect(arr).to.be.an('array');
    expect(arr).to.have.lengthOf(3);
    expect(arr).to.include(2);
  });
});
