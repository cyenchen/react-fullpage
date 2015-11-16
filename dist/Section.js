'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var Section = _react2['default'].createClass({
  displayName: 'Section',

  propTypes: {
    color: _react2['default'].PropTypes.string
  },

  getInitialState: function getInitialState() {
    return {};
  },

  componentDidMount: function componentDidMount() {},

  componentWillUnmount: function componentWillUnmount() {},

  componentDidUpdate: function componentDidUpdate() {},

  render: function render() {
    var alignVertical = this.props.verticalAlign;

    var sectionStyle = {
      width: '100%',
      display: alignVertical ? 'table' : 'block',
      height: this.props.windowHeight,
      maxHeight: this.props.windowHeight,
      overflow: 'scroll',
      backgroundColor: this.props.color,
      paddingTop: this.props.sectionPaddingTop,
      paddingBottom: this.props.sectionPaddingBottom
    };

    return _react2['default'].createElement(
      'div',
      { className: this.props.sectionClassName + (this.props.className ? ' ' + this.props.className : ''), id: this.props.id, style: sectionStyle },
      alignVertical ? this._renderVerticalAlign() : this.props.children
    );
  },

  _renderVerticalAlign: function _renderVerticalAlign() {
    var verticalAlignStyle = {
      display: 'table-cell',
      verticalAlign: 'middle',
      width: '100%'
    };

    return _react2['default'].createElement(
      'div',
      { style: verticalAlignStyle },
      this.props.children
    );
  }
});

exports['default'] = Section;
module.exports = exports['default'];