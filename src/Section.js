import React from 'react';

const Section = React.createClass({
  propTypes: {
    color: React.PropTypes.string
  },

  contextTypes: {
    verticalAlign: React.PropTypes.bool,
    sectionClassName: React.PropTypes.string,
    sectionPaddingTop:      React.PropTypes.string,
    sectionPaddingBottom:   React.PropTypes.string,
    windowHeight:           React.PropTypes.number,
  },

  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {},

  componentWillUnmount: function() {},

  render() {
    let alignVertical = this.props.verticalAlign || this.context.verticalAlign;

    let sectionStyle = {
      width:            '100%',
      display:          alignVertical ? 'table' : 'block',
      height:           this.context.windowHeight,
      maxHeight:        this.context.windowHeight,
      overflow:         'scroll',
      backgroundColor:  this.props.color,
      paddingTop:       this.context.sectionPaddingTop,
      paddingBottom:    this.context.sectionPaddingBottom,
    };

    return (
      <div className={this.context.sectionClassName + (this.props.className ? ` ${this.props.className}` : '')} id={this.props.id} style={sectionStyle}>
        {alignVertical ? this._renderVerticalAlign() : this.props.children}
      </div>
    );
  },

  _renderVerticalAlign() {
    let verticalAlignStyle = {
      display: 'table-cell',
      verticalAlign: 'middle',
      width: '100%'
    };

    return (
      <div style={verticalAlignStyle}>
        {this.props.children}
      </div>
    );
  }
});

export default Section;
