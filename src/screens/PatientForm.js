import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, SafeAreaView, Button, Dimensions } from 'react-native';
import {
  FormInput,
} from "@99xt/first-born";
// import { Picker } from 'native-base';
// import {Picker} from '@react-native-picker/picker';
import { RadioButton } from 'react-native-paper';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { StackActions, useFocusEffect } from '@react-navigation/native';
import { Checkbox, Divider } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { JSHash, JSHmac, CONSTANTS } from "react-native-hash";
import { CREATE_PATIENT_KEY } from '../../env.json';
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import { TouchableOpacity } from 'react-native';

const PatientForm = (props) => {

  const [userToken, setUserToken] = useState(null);
  const [center_no, setCenter_no] = useState('');
  // const { patient, route, database, navigation } = props

  // useFocusEffect(
  //     React.useCallback(() => {
  //         return () => {
  //             const popAction = StackActions.pop(1);
  //             navigation.dispatch(popAction);
  //             console.log("cleaned up");
  //         };
  //     }, [])
  // );



  const [fname, setFName] = useState('');
  const [lname, setLName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [idNum, setIDNum] = useState('');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {

    AsyncStorage.getItem('user')
      .then(user => {
        if (user === null) {
          // this.setState({loading: false, showLoginForm: true});
        } else {
          let usr = JSON.parse(user);
          setUserToken(usr.token);
          setCenter_no(usr.center_no);
        }
      })
      .catch(err => console.log(err));

    if (props.patient) {
      setFName(patient.fname);
      setLName(patient.lname);
      setGender(patient.gender);
      setDob(new Date(patient.dob));
    }
  });

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setDob('');
  };

  const handleConfirm = (e) => {
    hideDatePicker();
    var date = new Date(e);

    if (isNaN(date.getTime())) {
      setDob('')
    }
    else {
      //format date
      // setDob((date.getDate() + 1) + '/' + date.getMonth() + '/' + date.getFullYear())
      setDob(date.getFullYear() + '-' + date.getMonth() + '-' + (date.getDate() + 1))

    }

  };

  // some validation variables
  const [data, setData] = React.useState({
    isValidNIN: true,

    isValidFName: true,
    isValidLName: true,
    isValidGender: true,
    isValidDob: true,
  });

  //helper method
  const removeSpaces = (string) => {
    return string.split(' ').join('');
  };

  const savePatient = () => {

    // if (isNINAvailable) {
    //   data.isValidNIN = !(removeSpaces(idNum) === "");

    //   //step 1. check for required fields: idNum
    //   if (!(removeSpaces(idType) === "") && data.isValidNIN) {

    //     JSHash(idNum, CONSTANTS.HashAlgorithms.sha256)
    //       .then(hash => console.log(hash))
    //       .catch(
    //         // e => console.log(e)
    //         );

    //     alert("Case has been Recorded");

    //     clearState();
    //   } else {
    //     alert("Fill in all the fields");
    //   }

    // } else {

    //step 1. check for required fields: fname, lname, gender, dob
    data.isValidFName = !(removeSpaces(fname) === "");
    data.isValidLName = !(removeSpaces(lname) === "");
    data.isValidGender = !(removeSpaces(gender) === "");
    data.isValidDob = !(removeSpaces(dob) === "");
    data.isValidNIN = !(removeSpaces(idNum) === "");

    if (data.isValidFName && data.isValidLName && data.isValidGender && data.isValidDob && data.isValidNIN) {
      var stdID = idNum;
      JSHash(stdID, CONSTANTS.HashAlgorithms.sha256)
        .then(hash => {
          console.log("sending.." + userToken);

          console.log('check.. ' + idNum + "...\n" + hash)
          var data = {
            "fname": `${fname}`,
            "lname": `${lname}`,
            "nin": `${idNum}`,
            "nin_hash": `${hash}`,
            "gender": `${gender}`,
            "dob": `${dob}`,
            "isAcive": true
          };

          //-----------------saving patient to app db-------------------

          if (props.patient) {
            handleUpdatePatient(data);
          } else {
            handleAddNewPatient(data);
          }
          //-----------------saving patient to app db-------------------

          //-----------------saving patient to remote-------------------

          // var config = {
          //   method: 'post',
          //   url: CREATE_PATIENT_KEY,
          //   headers: {
          //     'Authorization': `Bearer ${userToken}`
          //   },
          //   data: data
          // };

          // if (userToken === null) {
          //   alert("Login to continue");
          // } else {
          //   axios(config)
          //     .then(function (response) {

          //       if (response.status === 201) {
          //         alert("Patient has been Recorded");

          //         clearState();
          //       } else {
          //         alert("Error failed to record patient\n Try again.")
          //         console.log(JSON.stringify(response.data));
          //       }
          //     })
          //     .catch(function (error) {
          //       console.log(error);
          //     });
          // }
          //-----------------saving patient to remote-------------------
        })
        .catch(
          e => console.log("Hashing Catch: " + e)
        );
    }
    else {
      alert("Fill in all the fields");
    }
    // }
  };

  const handleAddNewPatient = async (data) => {
    const { database } = props;
    const patients = database.collections.get('patients');
    const newPatient = await patients.create(patient => {
      patient.nin_hash = data.nin_hash,
        patient.nin = data.nin,
        patient.fname = data.fname,
        patient.lname = data.lname,
        patient.dob = data.dob,
        patient.gender = data.gender,
        patient.isActive = data.isActive
    })
    props.navigation.goBack()
  }

  const handleUpdatePatient = async (data) => {
    const { patient } = props;
    await patient.updatePatient(data)
    props.navigation.goBack()
  }

  const cancel = () => {
    //clear fields, back to home
    clearState();
    props.navigation.navigate("Home");
  };

  const clearState = () => {
    setFName(''); setLName(''); setDob(''); setIDNum('');
    setIDType(''); setGender('');
    data.isValidNIN = data.isValidLName = data.isValidFName = data.isValidGender = data.isValidDob = true;
  };


  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={{ alignSelf: "center" }}>
          <Text style={{ paddingHorizontal: 20, fontWeight: "bold" }}>
            {"Enter The Patient's Details:".toUpperCase()}
          </Text></View>

        <Divider style={{ marginVertical: 5 }} />

        <ScrollView>
          <View style={styles.action}>
            <TextInput style={{ fontSize: 16, width: '100%' }} label="First name" placeholder="First name" onChangeText={(val) => { setFName(val) }}
              value={fname} />
          </View>
          <View style={styles.action}>
            <TextInput style={{ fontSize: 16, width: '100%' }} label="Last name" placeholder="Last name" onChangeText={(val) => { setLName(val); }}
              value={lname} />
          </View>
          <View style={[styles.view, { paddingTop: 20, paddingBottom: 5 }]}>
            <Text style={{ fontSize: 16, color: '#808080', marginRight: '2%' }}>Gender : </Text>
            <TouchableOpacity onPress={() => setGender('M')} style={[styles.view, { paddingHorizontal: "4%" }]}>
              <Text style={{ fontSize: 15.5 }}>Male</Text>
              <RadioButton value="M" status={gender === 'M' ? 'checked' : 'unchecked'} color="purple" onPress={() => setGender('M')} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGender('F')} style={[styles.view, { paddingHorizontal: "4%" }]}>
              <Text style={{ fontSize: 15.5 }}>Female</Text>
              <RadioButton value="F" color="purple" status={gender === 'F' ? 'checked' : 'unchecked'} onPress={() => setGender('F')} />
            </TouchableOpacity>
          </View>

          <View style={styles.action}>
            <TextInput style={{ fontSize: 16, width: '100%' }} onFocus={showDatePicker} onKeyPress={showDatePicker} label="Date of Birth" placeholder="Enter Date of Birth"
              value={dob == '' ? '' : `Date of Birth:  ${dob}`} showSoftInputOnFocus={false} />
          </View>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
          <View style={styles.action}>
            <TextInput style={{ fontSize: 16, width: '100%' }} label="NIN" placeholder="NIN" onChangeText={(val) => setIDNum(val)} value={idNum} />
          </View>
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5,
            paddingTop: 30, marginBottom: 10
          }}>
            <View style={{ width: 80, marginBottom: 10 }}>
              <Button rounded
                block
                style={styles.btn}
                color="red" title="Cancel" onPress={() => { cancel() }} />

            </View>
            <View style={{ width: 80, marginBottom: 10 }}>
              <Button title="Register"
                rounded
                block
                style={styles.btn}
                color="#FFB236"
                onPress={() => { savePatient() }}
              >
              </Button>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PatientForm;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
    width: "100%", height: "100%",
    // marginTop: 10,
    paddingHorizontal: 20,
    // backgroundColor: "#F3F6F9"
  },
  action: {
    flexDirection: 'row',
    paddingTop: 15,
    borderBottomColor: "#dedede",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  action2: {
    paddingTop: 5,
    borderBottomColor: "#dedede",
    borderBottomWidth: 1,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20
  },
  color_textPrivate: {
    color: 'grey'
  },
  qrcode: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,

  },
  view: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 10
  }

});