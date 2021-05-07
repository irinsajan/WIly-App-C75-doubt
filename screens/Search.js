import React from 'react';
import { View, Text, StyleSheet,TouchableOpacity, TextInput, FlatList } from 'react-native';
import db from '../config';


export default class Search extends React.Component{
    constructor(){
        super();
        this.state = {
            allTransactions: [],
            searchText: '',
            lastVisibleTransaction: null
        }
    }

    componentDidMount = async () => {
        const query = await db.collection('transactions').limit(10).get()
        query.docs.map((doc) => {
            this.setState({
                allTransactions: [...this.state.allTransactions,doc.data()]
            })
        })
    }

    searchTransaction = async(text) => {
        var enteredText = text.split("");
        var text = text.toUpperCase();

        if(enteredText[0].toUpperCase() === 'B'){
            const transaction = await db.collection('transactions').where('bookId','==',text).get()
            transaction.docs.map((doc) => {
                this.setState({
                    allTransactions: [...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction: doc
                })
            })
        }
        else if(enteredText[0].toUpperCase() === 'S'){
            const transaction = await db.collection('transactions').where('studentId','==',text).get()
            transaction.docs.map((doc) => {
                this.setState({
                    allTransactions: [...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction: doc
                })
            })
        }
    }

    fetchMoreTransaction = async(text) => {
        var enteredText = text.split("");
        var text = text.toUpperCase();

        if(enteredText[0].toUpperCase() === 'B'){
            const transaction = await db.collection('transactions').where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).get()
            transaction.docs.map((doc) => {
                this.setState({
                    allTransactions: [...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction: doc
                })
            })
        }
        else if(enteredText[0].toUpperCase() === 'S'){
            const transaction = await db.collection('transactions').where('studentId','==',text).startAfter(this.state.lastVisibleTransaction).get()
            transaction.docs.map((doc) => {
                this.setState({
                    allTransactions: [...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction: doc
                })
            })
        }
    }

    render(){
        return(
            <View style={styles.container}>
                <View style={styles.searchView}>
                    <TextInput style={styles.inputBox}
                        placeholder="Enter book or student id"
                        onChangeText={(text) => {
                            this.setState({
                                searchText: text
                            });
                        }}/>
                    <TouchableOpacity style={styles.searchButton}
                        onPress={() => this.searchTransaction(this.state.searchText)}>
                        <Text>Search</Text>
                    </TouchableOpacity>
                </View>   
                <FlatList
                    data = {this.state.allTransactions}
                    renderItem = {({item}) => {return(
                        <View style={{borderBottomWidth:2}}>
                            <Text>{'Book Id: '+item.bookId}</Text>
                            <Text>{'Student Id: '+item.studentId}</Text>
                            <Text>{'Transaction type '+item.transactionType}</Text>
                            <Text>{'Date: '+item.date.toDate()}</Text>
                        </View>
                    )}}
                />             
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20
    },
    searchView: {
        flexDirection: 'row',
        height: 40,
        width: 'auto',
        borderWidth: 0.5,
        backgroundColor: 'lightgrey',
        justifyContent: 'center'
    },
    inputBox: {
        width: 300,
        height: 30,
        borderWidth: 2,
        paddingLeft: 10,
    },
    searchButton: {
        height: 30,
        width: 50,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'green'
    }
})