// @flow

import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import setStatic from 'recompose/setStatic';
import Transition from 'rsuite-utils/lib/Animation/Transition';
import shallowEqual from 'rsuite-utils/lib/utils/shallowEqual';
import _ from 'lodash';

import SidenavBody from './SidenavBody';
import SidenavHeader from './SidenavHeader';
import SidenavToggle from './SidenavToggle';

import { prefix, defaultProps, getUnhandledProps } from './utils';

type Props = {
  classPrefix?: string,
  className?: string,
  expanded: boolean,
  appearance: 'default' | 'inverse' | 'subtle',
  defaultOpenKeys?: Array<any>,
  openKeys?: Array<any>,
  onOpenChange?: (openKeys: Array<any>, event: SyntheticEvent<*>) => void,
  activeKey?: any,
  defaultActiveKey?: any,
  onSelect?: (eventKey: Array<any>, event: SyntheticEvent<*>) => void,
  componentClass: React.ElementType
};

type State = {
  activeKey?: any,
  openKeys?: Array<any>
};

class Sidenav extends React.Component<Props, State> {
  static defaultProps = {
    appearance: 'default',
    expanded: true
  };

  static childContextTypes = {
    activeKey: PropTypes.any,
    openKeys: PropTypes.array,
    expanded: PropTypes.bool,
    sidenav: PropTypes.bool,
    onSelect: PropTypes.func,
    onOpenChange: PropTypes.func
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      activeKey: props.defaultActiveKey,
      openKeys: props.defaultOpenKeys || []
    };
  }

  getChildContext() {
    const { expanded, openKeys, activeKey } = this.props;

    return {
      expanded,
      sidenav: true,
      activeKey: _.isUndefined(activeKey) ? this.state.activeKey : activeKey,
      openKeys: _.isUndefined(openKeys) ? this.state.openKeys : openKeys,
      onOpenChange: this.handleOpenChange,
      onSelect: this.handleSelect
    };
  }

  handleSelect = (eventKey: any, event: SyntheticEvent<*>) => {
    const { onSelect } = this.props;

    this.setState({ activeKey: eventKey });
    onSelect && onSelect(eventKey, event);
  };

  handleOpenChange = (eventKey: any, event: SyntheticEvent<*>) => {
    const { onOpenChange } = this.props;
    const find = key => shallowEqual(key, eventKey);
    let openKeys = _.clone(this.state.openKeys) || [];

    if (openKeys.some(find)) {
      _.remove(openKeys, find);
    } else {
      openKeys.push(eventKey);
    }

    this.setState({ openKeys });

    onOpenChange && onOpenChange(openKeys, event);
  };

  render() {
    const {
      className,
      classPrefix,
      appearance,
      expanded,
      openKeys,
      defaultOpenKeys,
      componentClass: Component,
      ...props
    } = this.props;

    const addPrefix = prefix(classPrefix);
    const classes = classNames(classPrefix, addPrefix(appearance), className);
    const unhandled = getUnhandledProps(Sidenav, props);

    return (
      <Transition
        in={expanded}
        timeout={300}
        exitedClassName={addPrefix('collapse-out')}
        exitingClassName={addPrefix(['collapse-out', 'collapsing'])}
        enteredClassName={addPrefix('collapse-in')}
        enteringClassName={addPrefix(['collapse-in', 'collapsing'])}
      >
        <Component {...unhandled} className={classes} role="navigation" />
      </Transition>
    );
  }
}

const EnhancedSidenav = defaultProps({
  classPrefix: 'sidenav',
  componentClass: 'div'
})(Sidenav);

setStatic('Header', SidenavHeader)(EnhancedSidenav);
setStatic('Body', SidenavBody)(EnhancedSidenav);
setStatic('Toggle', SidenavToggle)(EnhancedSidenav);

export default EnhancedSidenav;
