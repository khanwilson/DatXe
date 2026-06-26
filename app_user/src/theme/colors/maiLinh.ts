import { IAppColor } from './IAppColor';

const MaiLinhPalette: IAppColor = {
  primary: {
    darkGreen: '#006B39',
    actionGreen: '#00843D',
    brandGreen: '#009344',
  },

  background: {
    app: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F2F2F7',
  },

  text: {
    primary: '#000000',
    secondary: '#575655',
    inverse: '#FFFFFF',
    disabled: '#B0B0B0',
  },

  button: {
    primaryBg: '#00843D',
    primaryText: '#FFFFFF',
    disabledBg: '#E8E8E8',
    disabledText: '#B0B0B0',
  },

  input: {
    border: '#CBD5E1',
    borderFocus: '#00843D',
    placeholder: '#B0B0B0',
    bg: '#FFFFFF',
  },

  border: {
    default: '#CBD5E1',
    light: '#E8E8E8',
    focus: '#00843D',
  },

  state: {
    success: '#009344',
    warning: '#FEF100',
    error: '#EB1E27',
    info: '#0061C1',
    disabledText: '#B0B0B0',
  },

  navigation: {
    headerBg: '#006B39',
    headerText: '#FFFFFF',
    tabActiveBg: '#FFFFFF',
    tabActiveText: '#009344',
    tabInactiveText: '#575655',
    tabBg: '#FFFFFF',
    tabBorder: '#CBD5E1',
  },

  card: {
    bg: '#FFFFFF',
    border: '#CBD5E1',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  trip: {
    statusAccepted: '#009344',
    statusPending: '#FEF100',
    statusCancelled: '#EB1E27',
    statusCompleted: '#00843D',
  },

  map: {
    pinStart: '#009344',
    pinEnd: '#EB1E27',
    route: '#00843D',
  },

  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export default MaiLinhPalette;
