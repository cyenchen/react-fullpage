import React from 'react';
import ReactDOM from 'react-dom';

const SectionsContainer = React.createClass({
  scrollId: null,
  isScrolling: false,
  newSection: false,
  scrollings: [],
  prevMouseWheelTime: new Date().getTime(),

  propTypes: {
    delay:                  React.PropTypes.number,
    verticalAlign:          React.PropTypes.bool,
    scrollBar:              React.PropTypes.bool,
    navigation:             React.PropTypes.bool,
    className:              React.PropTypes.string,
    sectionClassName:       React.PropTypes.string,
    navigationClass:        React.PropTypes.string,
    navigationAnchorClass:  React.PropTypes.string,
    activeClass:            React.PropTypes.string,
    sectionPaddingTop:      React.PropTypes.string,
    sectionPaddingBottom:   React.PropTypes.string,
    arrowNavigation:        React.PropTypes.bool,
  },

  childContextTypes: {
     verticalAlign:          React.PropTypes.bool,
     sectionClassName:       React.PropTypes.string,
     sectionPaddingTop:      React.PropTypes.string,
     sectionPaddingBottom:   React.PropTypes.string,
     windowHeight:           React.PropTypes.number,
  },

  getInitialState() {
    return {
      activeSection: 0,
      scrollingStarted: false,
      sectionScrolledPosition: 0,
      windowHeight: 500
    };
  },

  getDefaultProps() {
    return {
      delay:                1000,
      verticalAlign:        false,
      scrollBar:            false,
      navigation:           true,
      className:            'SectionContainer',
      sectionClassName:     'Section',
      anchors:              [],
      activeClass:          'active',
      sectionPaddingTop:    '0',
      sectionPaddingBottom: '0',
      arrowNavigation:      true
    };
  },

  getChildContext() {
     return {
       verticalAlign:          this.props.verticalAlign,
       sectionClassName:       this.props.sectionClassName,
       sectionPaddingTop:      this.props.sectionPaddingTop,
       sectionPaddingBottom:   this.props.sectionPaddingBottom,
       windowHeight:           this.state.windowHeight
     };
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.activeSection !== nextState.activeSection) {
      return true;
    }
    if (this.state.windowHeight !== nextState.windowHeight) {
      return true;
    }

    return false;
  },

  componentWillUnmount() {
    this._removeMouseWheelEventHandlers();
    window.removeEventListener('resize', this._handleResize);
    window.removeEventListener('hashchange', this._handleAnchor, false);
    window.removeEventListener('keydown', this._handleArrowKeys);
  },

  componentDidMount() {
    window.addEventListener('resize', this._handleResize);

    if (!this.props.scrollBar) {
      this._addCSS3Scroll();
      this._handleAnchor(); //Go to anchor in case we found it in the URL
      this.addTransitionEnd();

      window.addEventListener('hashchange', this._handleAnchor, false); //Add an event to watch the url hash changes


      if (this.props.arrowNavigation) {
        window.addEventListener('keydown', this._handleArrowKeys);
      }
    }

    // Get actual window height
    if (this.state.windowHeight !== window.innerHeight) this._handleResize(true);
  },

  _addCSS3Scroll() {
    this._addOverflowToBody();
    this._addHeightToParents();
    this._addMouseWheelEventHandlers();
  },

  _addActiveClass() {
    this._removeActiveClass();

    let hash = window.location.hash.substring(1);
    let activeLinks = document.querySelectorAll(`a[href="#${hash}"]`);

    for( let i=0; i < activeLinks.length; i++) {
      activeLinks[i].className = activeLinks[i].className + (activeLinks[i].className.length > 0 ? ' ': '') + `${this.props.activeClass}`;
    }
  },

  _removeActiveClass() {
    let activeLinks = document.querySelectorAll(`a:not([href="#${this.props.anchors[this.state.activeSection]}"])`);

    for( let i=0; i < activeLinks.length; i++) {
      activeLinks[i].className = activeLinks[i].className.replace(/\b ?active/g, '');
    }
  },

  _addChildrenWithAnchorId() {
    var index = 0;
    return React.Children.map(this.props.children, function (child) {
      let id = this.props.anchors[index];
      index++;
      if (id) {
        return React.cloneElement(child, {
          id: id
        });
      } else {
        return child;
      }
    }.bind(this));
  },

  _addOverflowToBody() {
    document.querySelector('body').style.overflow = 'hidden';
  },

  _addHeightToParents() {
    let child = ReactDOM.findDOMNode(this);
    let previousParent = child.parentNode;

    while (previousParent) {
      if ('style' in previousParent) {
        previousParent.style.height = '100%';
        previousParent = previousParent.parentNode;
      } else {
        return false;
      }
    }
  },

  _addMouseWheelEventHandlers() {
    var prefix = '';
    var _addEventListener;

    if (window.addEventListener){
      _addEventListener = "addEventListener";
    }else{
      _addEventListener = "attachEvent";
      prefix = 'on';
    }

     // detect available wheel event
    var support = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support "wheel"
      document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least "mousewheel"
      'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox


    if(support == 'DOMMouseScroll'){
      document[ _addEventListener ](prefix + 'MozMousePixelScroll', this._mouseWheelHandler, false);
    }

    //handle MozMousePixelScroll in older Firefox
    else{
      document[ _addEventListener ](prefix + support, this._mouseWheelHandler, false);
    }
  },

  _removeMouseWheelEventHandlers() {
    if (document.addEventListener) {
      document.removeEventListener('mousewheel', this._mouseWheelHandler, false); //IE9, Chrome, Safari, Oper
      document.removeEventListener('wheel', this._mouseWheelHandler, false); //Firefox
      document.removeEventListener('MozMousePixelScroll', this._mouseWheelHandler, false); //old Firefox
    } else {
      document.detachEvent('onmousewheel', this._mouseWheelHandler); //IE 6/7/8
    }
  },

  _mouseWheelHandler(evt) {
    const curTime = new Date().getTime();
    const timeDiff = curTime - this.prevMouseWheelTime;
    this.prevMouseWheelTime = curTime;

    if (this.isScrolling) {
      console.log('trapped');
      return false;
    }

    const e             = evt || window.event; // old IE support
	  const delta         = Math.max(-1, Math.min(1, (e.wheelDelta || -e.deltaY || -e.detail)));

    if (timeDiff < 200) {
      console.log('!time diff!');
      return false;
    }

    let activeSection = this.state.activeSection;

    if (delta < 0) {
      activeSection++;
    } else {
      activeSection--;
    }

    if (activeSection < 0 || activeSection >= this.props.children.length || activeSection === this.state.activeSection) {
      console.log('failed: ', activeSection);
      return false;
    }

    let index = this.props.anchors[activeSection];
    if (!this.props.anchors.length || index) {
      window.location.hash = '#' + index;
    } else {
      this._goToSlide(activeSection);
    }

    return false;
  },

  _handleResize(initialResize) {
    let position = 0;

    if (initialResize) {
      let index = this._getSectionIndexFromHash();
      if (index < 0) index = this.state.activeSection;

      position = 0 - (index * window.innerHeight)
      this.setState({
        activeSection: index,
        windowHeight: window.innerHeight,
        sectionScrolledPosition: position
      });
    } else {
      position = 0 - (this.state.activeSection * window.innerHeight);
      this.setState({
        windowHeight: window.innerHeight,
        sectionScrolledPosition: position
      });
    }
  },

  _goToSlide(index) {
    const position = 0 - (index * this.state.windowHeight);

    this.isScrolling = true;
    this.newSection = true;

    this.setState({
      activeSection: index,
      sectionScrolledPosition: position
    });
  },

  _handleSectionTransition(index) {
    if (!this.props.anchors.length || index === -1 || index >= this.props.anchors.length) {
      return false;
    }

    this._goToSlide(index);
  },

  _handleArrowKeys(e) {
    let event     = window.event ? window.event : e;
    let direction = event.keyCode === 38 || event.keyCode === 37 ? this.state.activeSection - 1 : (event.keyCode === 40 || event.keyCode === 39 ? this.state.activeSection + 1 : -1);
    let hash      = this.props.anchors[direction];

    if (!this.props.anchors.length || hash) {
      window.location.hash = '#' + hash;
    }

    this._handleSectionTransition(direction);
  },

  _getSectionIndexFromHash() {
    const hash  = window.location.hash.substring(1);
    return this.props.anchors.indexOf(hash);
  },

  _handleAnchor() {
    const index = this._getSectionIndexFromHash();
    if (index < 0) return false;

    this._handleSectionTransition(index);

    this._addActiveClass();
  },

  renderNavigation() {
    let navigationStyle = {
      position:   'fixed',
      zIndex:     '10',
      right:      '20px',
      top:        '50%',
      transform:  'translate(-50%, -50%)',
    };

    const anchors = this.props.anchors.map((link, index) => {
      let anchorStyle = {
        display:          'block',
        margin:           '10px',
        borderRadius:     '100%',
        backgroundColor:  '#556270',
        padding:          '5px',
        transition:       'all 0.2s',
        transform:        this.state.activeSection === index ? 'scale(1.3)' : 'none'
      };
      return <a href={`#${link}`} key={index} className={this.props.navigationAnchorClass || 'Navigation-Anchor'} style={this.props.navigationAnchorClass ? null : anchorStyle}></a>;
    });

    return (
      <div className={this.props.navigationClass || 'Navigation'} style={this.props.navigationClass ? null : navigationStyle}>
        {anchors}
      </div>
    );
  },
  onTransitionEnd() {
    if (this.newSection) {
      console.log('...ON transition end...');
      this.scrollId = null;
      this.newSection = false;
      this.isScrolling = false;
      /*
      clearTimeout(this.scrollId);
      this.scrollId = setTimeout(() => {
        console.log('...ON transition end...');
        this.scrollId = null;
        this.newSection = false;
        this.isScrolling = false;
        let index = this.props.anchors[this.state.activeSection];
        if (!this.props.anchors.length || index) {
          window.location.hash = '#' + index;
        }
      }, 100);
      */
    }
  },

  addTransitionEnd() {
    const elm = ReactDOM.findDOMNode(this.refs.sectionContainer);
    elm.addEventListener('transitionend', this.onTransitionEnd);
  },

  render() {
    let containerStyle = {
      height:     '100%',
      width:      '100%',
      position:   'relative',
      transform:  `translate3d(0px, ${this.state.sectionScrolledPosition}px, 0px)`,
      transition: `all ${this.props.delay}ms ease`,
    };
    console.log('...render...');
    return (
      <div>
        <div ref='sectionContainer' className={this.props.className} style={containerStyle}>
          {this.props.scrollBar ? this._addChildrenWithAnchorId() : this.props.children}
        </div>
        {this.props.navigation && !this.props.scrollBar ? this.renderNavigation() : null}
      </div>
    );
  },

});

export default SectionsContainer;
