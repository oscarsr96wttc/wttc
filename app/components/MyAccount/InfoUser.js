import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Avatar} from 'react-native-elements';
import * as firebase from 'firebase';
import * as permissions from 'expo-permissions';
import * as imagePicker from 'expo-image-picker';

export default function InfoUser(props){

  const {
    userInfo:{ uid, displayName, email, photoURL },
    setReloadData,
    toastRef,
    setIsLoading,
    setTextLoading
  } = props

  const changeAvatar = async() => {
    const resultPermission = await permissions.askAsync(Permission.CAMERA_ROLL);
    const resultPermissionCamera = resultPermission.permissions.cameraRoll.status;

    if (resultPermissionCamera == "denied"){
      toastRef.current.show("Es necesario aceptar permisos")
    } else{
      const result = await imagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect : [4,3]
      })

      if(result.cancelled){
        toastRef.current.show("Has cerrado la galeria sin seleccionar imagen")
      } else {
        uploadImage(result.uri, uid).then(() => {
          updatePhotoUrl(uid)
        })
      }
    }
  }
  const uploadImage = async(uri, nameImage) => {
    setTextLoading("Actualizando avatar");
    setIsLoading(true);
    const response = await fetch(uri);
    const blob = await response.blob()
    const ref = firebase.storage().ref().child(`avatar/${nameImage}`)
    return ref.put(blob);
  }
  const updatePhotoUrl = uid => {
    firebase
      .storage()
      .ref(`avatar/${uid}`)
      .getDownloadURL()
      .then(async result => {
          const update = {
            photoURL : result
          };
          await firebase.auth().currentUser.updateProfile(update);
          setReloadData(true);
          setIsLoading(false);
      }).catch(() => {
        toastRef.current.show("Error al recuperar el avatar del servidor");
      })
  }
  return(
    <View style={styles.viewUserInfo}>
      <Avatar
        rounded
        size="large"
        showEditButton
        onEditPress = {changeAvatar}
        containerStyle = {styles.userInfoAvatar}
        source = {{
          uri: photoURL ? photoURL : "https://api.adorable.io/avatars/234/abott@adorable.png"
        }}
        />
      <View>
        <Text style={styles.displayName}>
          {displayName ? displayName : "Anonimo"}
        </Text>
        <Text>{email ? email : "Social Login"}</Text>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  viewUserInfo:{
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    paddingTop: 30,
    paddingBottom: 30
  },
  userInfoAvatar:{
    marginRight: 20
  },
  displayName:{
    fontWeight: "bold"
  }
})