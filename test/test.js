const getAdvice = require('../index')
const should = require('chai').should()

describe('chess problem', () => {
  it('#1 problem pass', () => {
    const advice = getAdvice(
      'x',
      [ ['o', 'e', 'e'],
        ['o', 'x', 'o'],
        ['x', 'x', 'e'] ]
    )

    advice.should.have.lengthOf(3)
    advice.should.have.deep.members([ [2, 2], [0, 1], [0, 2] ])
  })

  it('#2 problem pass', () => {
    const advice = getAdvice(
      'x',
      [ ['x', 'x', 'o'],
        ['e', 'e', 'e'],
        ['e', 'e', 'e'] ]
    )
    advice.should.have.lengthOf(0)
  })

  it('#3 problem pass', () => {
    const advice = getAdvice(
      'o',
      [ ['o', 'o', 'o'],
        ['e', 'e', 'e'],
        ['e', 'e', 'e'] ]
    )
    advice.should.have.lengthOf(0)
  })

  it('#4 problem pass', () => {
    const advice = getAdvice(
      'x',
      [ ['x', 'o', 'o'],
        ['x', 'x', 'e'],
        ['e', 'o', 'e'] ]
    )
    advice.should.have.lengthOf(3)
    advice.should.have.deep.members([ [2, 2], [1, 2], [2, 0] ])
  })
});
