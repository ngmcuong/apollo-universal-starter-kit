import PropTypes from 'prop-types';
import React from 'react';

import MessageText from './MessageText';
//import MessageImage from './MessageImage';
import Time from './Time';
import Color from './Color';

import { isSameUser, isSameDay } from './utils';

export default class Bubble extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onLongPress = this.onLongPress.bind(this);
  }

  onLongPress(e) {
    if (this.props.onLongPress) {
      this.props.onLongPress(e, this.props.currentMessage);
    }
  }

  handleBubbleToNext() {
    if (
      isSameUser(this.props.currentMessage, this.props.nextMessage) &&
      isSameDay(this.props.currentMessage, this.props.nextMessage)
    ) {
      return {
        ...styles[this.props.position].containerToNext,
        ...this.props.containerToNextStyle[this.props.position]
      };
    }
    return null;
  }

  handleBubbleToPrevious() {
    if (
      isSameUser(this.props.currentMessage, this.props.previousMessage) &&
      isSameDay(this.props.currentMessage, this.props.previousMessage)
    ) {
      return {
        ...styles[this.props.position].containerToPrevious,
        ...this.props.containerToPreviousStyle[this.props.position]
      };
    }
    return null;
  }

  renderMessageText() {
    if (this.props.currentMessage.text) {
      const { containerStyle, wrapperStyle, ...messageTextProps } = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps} />;
    }
    return null;
  }

  renderMessageImage() {
    if (this.props.currentMessage.image) {
      const { containerStyle, wrapperStyle, ...messageImageProps } = this.props;
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps);
      }
      // return <MessageImage {...messageImageProps} />;
    }
    return null;
  }

  renderTicks() {
    const { currentMessage } = this.props;
    if (this.props.renderTicks) {
      return this.props.renderTicks(currentMessage);
    }
    if (currentMessage.user._id !== this.props.user._id) {
      return null;
    }
    if (currentMessage.sent || currentMessage.received) {
      return (
        <div style={styles.tickView}>
          {currentMessage.sent && <span style={{ ...styles.tick, ...this.props.tickStyle }}>✓</span>}
          {currentMessage.received && <span style={{ ...styles.tick, ...this.props.tickStyle }}>✓</span>}
        </div>
      );
    }
    return null;
  }

  renderTime() {
    if (this.props.currentMessage.createdAt) {
      const { containerStyle, wrapperStyle, ...timeProps } = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <Time {...timeProps} />;
    }
    return null;
  }

  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props);
    }
    return null;
  }

  render() {
    return (
      <div onContextMenu={this.onLongPress} style={{ width: '100%' }}>
        <div
          className="message"
          style={{ ...styles[this.props.position].container, ...this.props.containerStyle[this.props.position] }}
        >
          <div
            style={{
              ...styles[this.props.position].wrapper,
              ...this.props.wrapperStyle[this.props.position],
              ...this.handleBubbleToNext(),
              ...this.handleBubbleToPrevious()
            }}
          >
            <div
              //accessibilityTraits="text"
              {...this.props.touchableProps}
            >
              <div>
                {this.renderCustomView()}
                {this.renderMessageImage()}
                {this.renderMessageText()}
                <div style={{ ...styles.bottom, ...this.props.bottomContainerStyle[this.props.position] }}>
                  {this.renderTime()}
                  {this.renderTicks()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  left: {
    container: {
      display: 'flex',
      alignItems: 'flex-start'
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.leftBubbleBackground,
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end'
    },
    containerToNext: {
      borderBottomLeftRadius: 3
    },
    containerToPrevious: {
      borderTopLeftRadius: 3
    }
  },
  right: {
    container: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-end'
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.defaultBlue,
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end'
    },
    containerToNext: {
      borderBottomRightRadius: 3
    },
    containerToPrevious: {
      borderTopRightRadius: 3
    }
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  tick: {
    fontSize: 10,
    backgroundColor: Color.backgroundTransparent,
    color: Color.white
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10
  }
};

Bubble.contextTypes = {
  actionSheet: PropTypes.func
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTicks: null,
  renderTime: null,
  position: 'left',
  currentMessage: {
    text: null,
    createdAt: null,
    image: null
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {}
};

Bubble.propTypes = {
  user: PropTypes.object.isRequired,
  touchableProps: PropTypes.object,
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderTime: PropTypes.func,
  renderTicks: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: PropTypes.object,
    right: PropTypes.object
  }),
  wrapperStyle: PropTypes.shape({
    left: PropTypes.object,
    right: PropTypes.object
  }),
  bottomContainerStyle: PropTypes.shape({
    left: PropTypes.object,
    right: PropTypes.object
  }),
  tickStyle: PropTypes.object,
  containerToNextStyle: PropTypes.shape({
    left: PropTypes.object,
    right: PropTypes.object
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: PropTypes.object,
    right: PropTypes.object
  })
};
