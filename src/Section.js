import React from 'react';

const Section = React.createClass({
  propTypes: {
    color: React.PropTypes.string
  },

  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {},

  componentWillUnmount: function() {},

  componentDidUpdate: function() {},

  render() {
    let alignVertical = this.props.verticalAlign;

    let sectionStyle = {
      width:            '100%',
      display:          alignVertical ? 'table' : 'block',
      height:           this.props.windowHeight,
      maxHeight:        this.props.windowHeight,
      overflow:         'scroll',
      backgroundColor:  this.props.color,
      paddingTop:       this.props.sectionPaddingTop,
      paddingBottom:    this.props.sectionPaddingBottom,
    };

    let children = React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child, { go: this.props.go });
    });

    return (
      <div className={this.props.sectionClassName + (this.props.className ? ` ${this.props.className}` : '')} id={this.props.id} style={sectionStyle}>
        {alignVertical ? this._renderVerticalAlign(children) : children}
      </div>
    );
  },

  _renderVerticalAlign(children) {
    let verticalAlignStyle = {
      display: 'table-cell',
      verticalAlign: 'middle',
      width: '100%'
    };

    return (
      <div style={verticalAlignStyle}>
        {children}
      </div>
    );
  }
});

export default Section;
