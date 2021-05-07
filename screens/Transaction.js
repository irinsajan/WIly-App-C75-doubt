import * as React from 'react';
import { View, Text, StyleSheet,TouchableOpacity, Image, Alert, KeyboardAvoidingView } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import firebase from 'firebase/app';
import db from '../config';

export default class Transaction extends React.Component{
    constructor(){
        super();
        this.state = {
            hasCameraPermissions: null,
            scanned: false,
            scannedBookId: '',
            scannedStudentId:'',
            buttonState: 'normal',
            transactionMessage: ''
        }
    }

    handleBarCodeScanned = async({type,data}) => {
        if(this.state.buttonState === "BookId"){
            this.setState({
                buttonState: 'normal',
                scanned: true,
                scannedBookId: data
            });
        }
        else if(this.state.buttonState === "StudentId"){
            this.setState({
                buttonState: 'normal',
                scanned: true,
                scannedStudentId: data
            });
        }
    }

    getCameraPermissions = async (id) => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions : status === "granted",
            buttonState: id,
            scanned: false
        });
    }

    handleTransaction = async() => {
        var transactionType = await this.checkBookEligibility();
        console.log(transactionType);
        if(!transactionType){
            Alert.alert("The books doesn't exist in library database");
            this.setState({
                'scannedBookId': '',
                'scannedStudentId': ''
            });
        }
        
        else if(transactionType === "Issue"){
            var isStudentEligible = await this.checkStudentEligibilityIssue();
            if(isStudentEligible){
                this.initiateBookIssue();
                Alert.alert("Book issued to the student");
            }
        }

        else{
            var isStudentEligible = await this.checkStudentEligibilityReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                Alert.alert("Book returned to the library");
            }

        }
    }

    checkStudentEligibilityIssue = async() => {
        const studentRef = await db.collection('students').where("studentId","==",this.state.scannedStudentId).get()
        var isStudentEligible=""
        if(studentRef.docs.length == 0){
            this.setState({
                'scannedBookId': '',
                'scannedStudentId': ''
            });
            isStudentEligible = false;
            Alert.alert("student id doesn't exist in the database");
        }
        else{
            studentRef.docs.map((doc) => {
                var student = doc.data();
                if(student.booksIssued < 2){
                    isStudentEligible = true;
                }
                else{
                    isStudentEligible = false;
                    Alert.alert("The student has already taken 2 books");
                    this.setState({
                        'scannedBookId': '',
                        'scannedStudentId': ''
                    });
                }
            })
        }

        return isStudentEligible;
    }

    checkStudentEligibilityReturn = async() => {
        const transactionRef = await db.collection('transactions').where("bookId","==",this.state.scannedBookId).limit(1).get()
        var isStudentEligible=""
        transactionRef.docs.map((doc) => {
            var lastTransaction = doc.data();
            if(lastTransaction.studentId === this.state.scannedStudentId){
                isStudentEligible = true;
            }
            else{
                isStudentEligible = false;
                Alert.alert("The book was not issued to the student");
                this.setState({
                    'scannedBookId': '',
                    'scannedStudentId': ''
                });
            }
        })

        return isStudentEligible;

    }

    checkBookEligibility = async() => {
        const bookref = await db.collection('books').where("bookId","==",this.state.scannedBookId).get()
        var transactionType = ""
        if(bookref.docs.length == 0){
            transactionType = false;
        }
        else{
            bookref.docs.map((doc) => {
                var book = doc.data();
                if(book.bookAvailability){
                    transactionType = "Issue";
                }
                else{
                    transactionType = "Return";
                }
            })
        }

        return transactionType;

    }


    initiateBookIssue = async() => {

        db.collection('transactions').add({
            'studentId': this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': "Issue"
        })

        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability': false
        })

        db.collection('students').doc(this.state.scannedStudentId).update({
            'booksIssued': firebase.firestore.FieldValue.increment(1)
        })

        
        this.setState({
            'scannedBookId': '',
            'scannedStudentId': ''
        })
    }

    initiateBookReturn = async() => {
        db.collection('transactions').add({
            'studentId': this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': "Return"
        })

        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability': true
        })

        db.collection('students').doc(this.state.scannedStudentId).update({
            'booksIssued': firebase.firestore.FieldValue.increment(-1)
        })

        this.setState({
            'scannedBookId': '',
            'scannedStudentId': ''
        })
    }

    render(){
        if(this.state.buttonState !== 'normal' && this.state.hasCameraPermissions){
            return(
                <BarCodeScanner
                    onBarCodeScanned = {this.state.scanned ? undefined : this.handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
            );
        }

        else if (this.state.buttonState === 'normal'){
            return(
                <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>

                    <View>
                        <Image
                            source={require('../assets/booklogo.jpg')}
                            style={{width:200, height:200}}
                        />
                        <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
                    </View>

                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.inputBox}
                            placeholder='Book Id'
                            onChangeText = {(text) => {
                                this.setState({scannedBookId: text});
                            }}
                            value={this.state.scannedBookId}
                        />
                        <TouchableOpacity style={styles.scanButton}
                            onPress = { () => {this.getCameraPermissions("BookId")}}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.inputBox}
                            placeholder='Student Id'
                            onChangeText = {(text) => {
                                this.setState({scannedStudentId: text});
                            }}
                            value={this.state.scannedStudentId}
                        />
                        <TouchableOpacity style={styles.scanButton}
                            onPress = { () => {this.getCameraPermissions("StudentId")}}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                   
                    <TouchableOpacity 
                        style={styles.submitButton}
                        onPress = {() => {this.handleTransaction()}}>
                        <Text style={styles.submitText}>SUBMIT</Text>
                    </TouchableOpacity>                    
                </KeyboardAvoidingView>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    displayText: {
        fontSize: 15,
        textDecorationLine: 'underline'
    },
    scanButton: {
        backgroundColor: '#66BB6A',
        width: 50, 
        borderWidth: 1.5,
        borderLeftWidth: 0
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 15,
        marginTop: 10
    },
    inputView: {
        flexDirection: 'row',
        margin: 20
    },
    inputBox: {
        width: 200,
        height: 50,
        borderWidth: 1.5,
        borderRightWidth: 0,
        fontSize: 20
    },
    submitButton :{
        backgroundColor: '#FBC02D',
        width: 100,
        height: 50
    },
    submitText: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        padding: 10

    }
    
})