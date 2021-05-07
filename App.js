import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import Transaction from './screens/Transaction';
import Search from './screens/Search';
import Login from './screens/Login';

export default class App extends React.Component{
  render() {
    return(
      <AppContainer />
    );
  }
}

const TabNavigator = createBottomTabNavigator({
  Transaction: {screen: Transaction},
  Search: {screen: Search}
},
{
  defaultNavigationOptions: ({navigation}) => {return({
    tabBarIcon : ({}) => {
      const routeName = navigation.state.routeName;
      if (routeName === 'Transaction'){
        return(
          <Image
            source={require('./assets/book.png')}
            style={{width:40,height:40}}
          />
        );
      }
      else if (routeName === 'Search'){
        return(
          <Image
            source={require('./assets/searchingbook.png')}
            style={{width:40,height:40}}
          />
        );
      }
    }
  })}

});

const SwitchNavigator = createSwitchNavigator({
  Login: {screen: Login},
  TabNavigator: {screen: TabNavigator}
});

const AppContainer = createAppContainer(SwitchNavigator);
