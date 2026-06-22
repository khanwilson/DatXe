import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  triangularViewTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10, // width: 20
    borderBottomWidth: 10, // height: 10
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  triangularViewBottom: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10, // width: 20
    borderTopWidth: 10, // height: 10
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  triangularViewLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10, // height: 20
    borderRightWidth: 10, // width: 10
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'white',
  },
  triangularViewRight: {
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10, // height: 20
    borderLeftWidth: 10, // width: 10 
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: 'white',
  },
});