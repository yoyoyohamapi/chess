const _ = require('lodash/fp')

const mapWithIndex = _.map.convert({ 'cap': false })

// 棋盘规模
const SCALE = 3

/**
 * 是否棋盘格没有落子
 * Object -> Boolean
 */
const isEmptyBoard = _.compose(
  _.isEqual('e'),
  _.prop('value')
)

/**
 * 是否棋盘格为某角色
 * String -> Object -> Boolean
 */
const isRoleBoard = role => _.compose(
  _.isEqual(role),
  _.prop('value')
)

/**
 * 展平棋盘格
 * [[a]] -> [Object]
 */
const getFlattenedChessboard = _.compose(
  mapWithIndex((value, index) => ({
    index,
    value
  })),
  _.flatten
)
/**
 * 获得为空的棋盘格
 * [a] -> [b]
 */
const getEmptyBoards = _.compose(
  _.map('index'),
  _.filter(isEmptyBoard)
)

/**
 * 获得角色已经占据的棋盘格
 * [a] -> [b]
 */
const getOccupiedBoards = role => _.compose(
  _.map('index'),
  _.filter(isRoleBoard(role))
)

/**
 * 获得顺序位置对应的行
 * Number a -> Number b
 */
const getRowByIndex = index => Math.floor(index / SCALE)

/**
 * 获得顺序位置对应的列
 * Number a -> Number b
 */
const getColByIndex = index => index % SCALE

/**
 * 将顺序位置变为棋盘位置
 * Number a -> [Number c]
 */
const indexToPos = index => [getRowByIndex(index), getColByIndex(index)]

/**
 * 获得顺序位置对应的对角线
 * Number a -> String
 */
const getDiagonalByIndex = _.cond([
  [index => index === (SCALE * SCALE - 1) / 2, _.always('center')], // 中心
  [index => index % (SCALE + 1) === 0, _.always('positive')], // 主对角线
  [index => index % (SCALE - 1) === 0, _.always('negative')], // 副对角线
  [_.T, _.always('none')] // 非对角线
])

const canMakeLine = group => _.compose(
  _.isEqual(SCALE - 1),
  _.prop('length'),
  _.prop(group)
)

/**
 * 获得建议
 * [[a]] -> [[b]]
 */
module.exports = _.curry((role, chessboard) => {
  // 展平棋盘
  const flattenedBoard = getFlattenedChessboard(chessboard)
  // 获得当前的空格
  const emptyBoards = getEmptyBoards(flattenedBoard)
  // 获得角色已经占据的格子
  const occupiedBoards = getOccupiedBoards(role)(flattenedBoard)
  // 按行、列、对角线分别划分格子
  const occupiedRowBoards = _.groupBy(getRowByIndex)(occupiedBoards)
  const occupiedColBoards = _.groupBy(getColByIndex)(occupiedBoards)
  const occupiedDiagonalBoards = _.compose(
    boards => {
      const positive = boards.positive || []
      const negative = boards.negative || []
      const center = boards.center || []
      return {
        positive: positive.concat(center),
        negative: negative.concat(center)
      }
    },
    _.pick(['positive', 'negative', 'center']),
    _.groupBy(getDiagonalByIndex)
  )(occupiedBoards)

  /**
   * 判断能否练成横线
   * Number a -> Bool
   */
  const canMakeHLine = _.compose(
    row => canMakeLine(row)(occupiedRowBoards),
    getRowByIndex,
  )

  /**
   * 判断能否练成竖线
   * Number a -> Bool
   */
  const canMakeVLine = _.compose(
    col => canMakeLine(col)(occupiedColBoards),
    getColByIndex
  )

  /**
   * 判断能否练成对角线
   * Number a -> Bool
   */
  const canMakeDLine = _.compose(
    diagonal => canMakeLine(diagonal)(occupiedDiagonalBoards),
    getDiagonalByIndex
  )

  /**
   * 判断在空格处置子能否获胜，即能否形成三子连线
   * Number a -> Bool
   */
  const canWin = _.anyPass([
    canMakeHLine,
    canMakeVLine,
    canMakeDLine
  ])

  /**
   * 获得可以落子的空位
   * [a] -> [[b, c]]
   */
  const getWins = _.compose(
    _.map(indexToPos), // 2. 转换为棋盘坐标
    _.filter(canWin), // 1. 过滤可以获胜的置子位
  )
  return getWins(emptyBoards)
})
