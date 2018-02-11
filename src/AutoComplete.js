// @flow
import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import OverlayTrigger from 'rsuite-utils/lib/Overlay/OverlayTrigger';
import { MenuWrapper } from 'rsuite-utils/lib/Picker';

import getUnhandledProps from './utils/getUnhandledProps';
import prefix, { globalKey } from './utils/prefix';
import Input from './Input';
import AutoCompleteItem from './AutoCompleteItem';

type DefaultEvent = SyntheticEvent<*>;
type PlacementEighPoints = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom';
type Props = {
  data: Array<string>,
  disabled?: boolean,
  onSelect?: (text: React.Node, event: DefaultEvent) => void,
  onChange?: (value: string, event: DefaultEvent) => void,
  classPrefix?: string,
  value?: string,
  defaultValue?: string,
  className?: string,
  placement?: PlacementEighPoints,
  onFocus?: (event: DefaultEvent) => void,
  onBlur?: (event: DefaultEvent) => void,
  renderItem?: (itemValue: string) => React.Node
};

type State = {
  value: string,
  focus?: boolean,
  focusItemValue?: string
}

class AutoComplete extends React.Component<Props, State> {

  static Item = AutoCompleteItem;
  static defaultProps = {
    classPrefix: `${globalKey}auto-complete`,
    data: [],
    placement: 'bottomLeft'
  };

  constructor(props: Props) {
    super(props);

    const nextValue = props.defaultValue;

    this.state = {
      value: nextValue || '',
      focus: false,
      focusItemValue: nextValue
    };
  }

  getValue() {
    const { value } = this.props;
    return _.isUndefined(value) ? this.state.value : value;
  }

  getFocusableMenuItems = (): Array<string> => {
    const { data } = this.props;
    if (!data) {
      return [];
    }
    return data.filter(this.shouldDisplay);
  }

  trigger = null;
  menuContainer = null;

  findNode(focus: Function) {

    const items = this.getFocusableMenuItems();
    const { focusItemValue } = this.state;

    for (let i = 0; i < items.length; i += 1) {
      if (_.eq(focusItemValue, items[i])) {
        focus(items, i);
        return;
      }
    }

    focus(items, -1);
  }

  shouldDisplay = (label: any) => {

    const { value } = this.state;
    if (!_.trim(value)) {
      return false;
    }
    const keyword = value.toLocaleLowerCase();
    return label.toLocaleLowerCase().indexOf(keyword) >= 0;
  }

  handleChange = (value: string, event: SyntheticInputEvent<HTMLInputElement>) => {
    const { onChange } = this.props;
    this.setState({
      focus: true,
      value
    });
    if (this.state.value !== value) {
      onChange && onChange(value, event);
    }
  };

  handleInputFocus = (event: DefaultEvent) => {
    const { onFocus } = this.props;
    this.open();
    onFocus && onFocus(event);
  }

  handleInputBlur = (event: DefaultEvent) => {
    const { onBlur } = this.props;
    this.close();
    onBlur && onBlur(event);
  }

  focusNextMenuItem() {
    this.findNode((items, index) => {
      const focusItemValue = items[index + 1];
      if (!_.isUndefined(focusItemValue)) {
        this.setState({ focusItemValue });
      }
    });
  }

  focusPrevMenuItem() {
    this.findNode((items, index) => {
      const focusItemValue = items[index - 1];
      if (!_.isUndefined(focusItemValue)) {
        this.setState({ focusItemValue });
      }
    });
  }

  selectFocusMenuItem(event: DefaultEvent) {
    const { onChange } = this.props;
    const { focusItemValue } = this.state;

    if (!focusItemValue) {
      return;
    }
    this.setState({
      value: focusItemValue,
      focusItemValue
    }, () => {
      onChange && onChange(focusItemValue, event);
      this.close();
    });
  }

  close = () => {
    this.setState({ focus: false });
  }
  open = () => {
    this.setState({ focus: true });
  }

  handleKeyDown = (event: SyntheticKeyboardEvent<*>) => {

    if (!this.menuContainer) {
      return;
    }

    switch (event.keyCode) {
      // down
      case 40:
        this.focusNextMenuItem();
        event.preventDefault();
        break;
      // up
      case 38:
        this.focusPrevMenuItem();
        event.preventDefault();
        break;
      // enter
      case 13:
        this.selectFocusMenuItem(event);
        event.preventDefault();
        break;
      // esc | tab
      case 27:
      case 9:
        this.close();
        event.preventDefault();
        break;
      default:
    }
  }

  handleSelect = (value: string, event: DefaultEvent) => {
    const { onChange, onSelect } = this.props;
    this.setState({
      value,
      focusItemValue: value
    });

    onSelect && onSelect(value, event);

    if (this.state.value !== value) {
      onChange && onChange(value, event);
    }
    this.close();
  }


  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  renderDropdownMenu() {
    const {
      placement,
      renderItem,
      data
    } = this.props;

    const { focusItemValue } = this.state;
    const classes = classNames(
      this.addPrefix('menu'),
      `${globalKey}-placement-${_.kebabCase(placement)}`
    );
    const items = data.filter(this.shouldDisplay);

    return (
      <MenuWrapper
        className={classes}
        onKeyDown={this.handleKeyDown}
      >
        <div
          ref={(ref) => {
            this.menuContainer = ref;
          }}
        >
          <ul role="menu">
            {
              items.map(item => (
                <AutoCompleteItem
                  key={item}
                  focus={focusItemValue === item}
                  value={item}
                  onSelect={this.handleSelect}
                  renderItem={renderItem}
                >
                  {item}
                </AutoCompleteItem>
              ))
            }
          </ul>
        </div>
      </MenuWrapper>
    );
  }
  render() {

    const {
      disabled,
      className,
      classPrefix,
      defaultValue,
      placement,
      data,
      ...rest
    } = this.props;

    const value = this.getValue();
    const unhandled = getUnhandledProps(AutoComplete, rest);
    const classes = classNames(classPrefix, {
      [this.addPrefix('disabled')]: disabled
    }, className);

    const hasItems = data.filter(this.shouldDisplay).length > 0;

    return (
      <div className={classes}>

        <OverlayTrigger
          ref={(ref) => {
            this.trigger = ref;
          }}
          disabled={disabled}
          trigger={['click', 'focus']}
          placement={placement}
          open={this.state.focus && hasItems}
          speaker={this.renderDropdownMenu()}
        >
          <Input
            {...unhandled}
            disabled={disabled}
            value={value}
            onBlur={this.handleInputBlur}
            onFocus={this.handleInputFocus}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
          />
        </OverlayTrigger>

      </div>
    );
  }
}


export default AutoComplete;
