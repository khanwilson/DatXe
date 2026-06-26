export interface IAppColor {
  // Primary: semantic brand greens
  primary: {
    darkGreen: string;
    actionGreen: string;
    brandGreen: string;
  };

  // Background surfaces
  background: {
    app: string;
    surface: string;
    surfaceAlt: string;
  };

  // Text
  text: {
    primary: string;
    secondary: string;
    inverse: string;
    disabled: string;
  };

  // Button
  button: {
    primaryBg: string;
    primaryText: string;
    disabledBg: string;
    disabledText: string;
  };

  // Input
  input: {
    border: string;
    borderFocus: string;
    placeholder: string;
    bg: string;
  };

  // Border & stroke
  border: {
    default: string;
    light: string;
    focus: string;
  };

  // State indicators
  state: {
    success: string;
    warning: string;
    error: string;
    info: string;
    disabledText: string;
  };

  // Navigation
  navigation: {
    headerBg: string;
    headerText: string;
    tabActiveBg: string;
    tabActiveText: string;
    tabInactiveText: string;
    tabBg: string;
    tabBorder: string;
  };

  // Cards
  card: {
    bg: string;
    border: string;
    shadow: string;
  };

  // Trip-specific (ride details, status badges)
  trip: {
    statusAccepted: string;
    statusPending: string;
    statusCancelled: string;
    statusCompleted: string;
  };

  // Map & location
  map: {
    pinStart: string;
    pinEnd: string;
    route: string;
  };

  // Utility: for legacy compatibility (gradually remove)
  white: string;
  overlay: string;
}
