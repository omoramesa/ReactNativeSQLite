import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, FlatList, TouchableHighlight} from 'react-native';

var SQLite = require('react-native-sqlite-storage');

const SQL_DROP_TODO = 'DROP TABLE todos';
const SQL_CREATE_TODO = 'CREATE TABLE IF NOT EXISTS todos(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, checked INTEGER NOT NULL )';
const SQL_INSERT_TODO = 'INSERT INTO todos (name, checked) VALUES ("Levantarse", 0), ("Bañarse", 0), ("Desayunar", 0), ("Ir a trabajar", 0)'
const SQL_SELECT_TODO = 'SELECT id, name, checked FROM todos';
const SQL_UPDATE_TODO = 'UPDATE todos SET checked=? WHERE id = ? ';
const db = SQLite.openDatabase({name: 'database-test.db', location : 'default'}); 

type Props = {};

export default class App extends Component<Props> {

  constructor(props){
    super(props);
    this.state = {
      todos: []
    };
  }

  componentDidMount(){
    this.connection();
  }
  
  connection(){
    console.log('Estableciendo la conexión');

    db.transaction(tx => {
      tx.executeSql(SQL_DROP_TODO, [], (success)=>{
        console.log('Tabla borrada exitosamente')
      }, (err)=> {
        console.log('error', err)
      })
    })

    db.transaction(tx => {
      tx.executeSql(SQL_CREATE_TODO, [], (success)=>{
        console.log('Tabla creada exitosamente')
      }, (err)=> {
        console.log('error', err)
      })
    })

    db.transaction(tx => {
      tx.executeSql(SQL_INSERT_TODO, [], (success)=>{
        console.log('Registro insertado exitosamente')
      }, (err)=> {
        console.log('error', err)
      })
    })

    db.transaction((tx)=>{
      tx.executeSql(SQL_SELECT_TODO, [], (tx, results) =>{
      var len = results.rows.length;
        for (let i = 0; i < len; i++) {
            let row = results.rows.item(i);  
          console.log(`Nombre Tarea: ${row.name}, Estado: ${row.checked}`);
        } 
        
        this.setState({ todos: results.rows.raw() }) 
    },(error) => {   
        console.log( 'Error: ', success ); 
      })
    })

  }

  actualizarTarea( todo ){  
    db.transaction((tx)=>{
    console.log('Id Tarea:',todo.id);
    tx.executeSql(SQL_UPDATE_TODO, [todo.checked == 1 ? 0 : 1, todo.id ], (results) =>{
      console.log('Tarea Actualizada:',todo.id);
         
    },(error) => {   
      console.log( 'Error: ', success ); 
    } )

    db.transaction((tx)=>{
      tx.executeSql(SQL_SELECT_TODO, [], (tx, results) =>{
      var len = results.rows.length;
        for (let i = 0; i < len; i++) {
            let row = results.rows.item(i);  
          console.log(`Nombre Tarea: ${row.name}, Estado: ${row.checked}`);
        } 
        
        this.setState({ todos: results.rows.raw() }) 
    },(error) => {   
        console.log( 'Error: ', success ); 
      })
    })

  });
  }

  renderItem=({item}) => <TouchableHighlight 
    onPress={()=> this.actualizarTarea( item )}
    underlayColor="#ccc"  
  >
    <View style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.contactName}>Tarea: {item.id} {item.name}</Text>
            <Text style={styles.contactName}>Estado: {item.checked == 0 ? 'Pendiente': 'Terminada'}</Text>
        </View>
    </View>
  </TouchableHighlight>
  separatorComponent=()=> <View style={styles.separator}></View>
  emptyComponent=()=> <Text>No hay tareas</Text> 
  keyExtractor=item => item.id.toString()

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.todos}
          renderItem={this.renderItem}
          ListItemComponent={this.emptyComponent}
          ItemSeparatorComponent={this.separatorComponent}
          keyExtractor={this.keyExtractor}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
  },
 
 
  separator: {
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    marginVertical: 3,
  },
  content: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  contactName:{
    fontSize: 18,
    fontWeight: '200',
  }
});