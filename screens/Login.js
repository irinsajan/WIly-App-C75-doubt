import React from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, View, Image, Alert } from 'react-native';
import firebase from 'firebase/app';

export default class Login extends React.Component{
    constructor(){
        super();
        this.state = {
            emailId: '',
            password: ''
        }
    }

    login = async(email,password) => {
        if(email && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email,password)
                if(response){
                    this.props.navigation.navigate('Transaction')
                }
            }
            catch(error){
                switch(error.code){
                    case 'auth/user-not-found': 
                        Alert.alert("User doesn't exist")
                        console.log("User doesn't exist")
                        break
                    case 'auth/invalid-email':
                        Alert.alert("Incorrect email id or password")
                        console.log("Incorrect email id or password")
                        break
                }              
            }
        }
        else{
            Alert.alert("enter email id and password");
        }
    }

    render(){
        return(
            <KeyboardAvoidingView style={{alignItems:'center', marginTop:20}}>
                <View>
                    <Image
                        source={require('../assets/booklogo.jpg')}
                        style={{width:200, height:200}}
                    />
                    <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
                </View>
                <View>
                    <TextInput
                        style={styles.loginBox}
                        placeholder="abc@example.com"
                        keyboardType='email-address'
                        onChangeText={(text) => {
                            this.setState({
                                emailId: text
                            })
                        }}
                    />
                    <TextInput
                        style={styles.loginBox}
                        secureTextEntry = {true}
                        placeholder="enter password"
                        onChangeText={(text) => {
                            this.setState({
                                password: text
                            })
                        }}
                    />
                </View>

                <View>
                    <TouchableOpacity style={styles.loginButton}
                        onPress={() => {
                            this.login(this.state.emailId, this.state.password)
                        }}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        ); 
    }
}

const styles = StyleSheet.create({
    loginBox: {
        width: 200,
        height: 40,
        fontSize: 20,
        paddingLeft: 10,
        margin: 10,
        borderWidth: 1.5
    },
    loginButton:{
        borderWidth: 1,
        width: 90,
        height: 40,
        marginTop: 10,
        borderRadius: 10,
        justifyContent: 'center'
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: 'bold'
    }
})