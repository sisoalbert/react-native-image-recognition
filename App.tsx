import 'react-native-reanimated';
import {Linking, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {labelImage} from 'vision-camera-image-labeler';
import {useSharedValue} from 'react-native-reanimated';
import {Label} from './src/components/Label';

type CameraPermissionStatus =
  | 'authorized'
  | 'denied'
  | 'restricted'
  | 'not-determined'
  | null;

const App = () => {
  const [cameraPermission, setCameraPermission] =
    useState<CameraPermissionStatus>(null);
  const [showCamera, setShowCamera] = useState(true);
  const currentLabel = useSharedValue('');

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.getCameraPermissionStatus();
      console.log('status:', status);

      if (status !== 'authorized') {
        const newStatus = await Camera.requestCameraPermission();
        if (newStatus === 'denied') {
          openSettings();
        }
        setCameraPermission(newStatus);
      } else {
        setCameraPermission(status);
      }
    };

    requestCameraPermission();
  }, []);
  const openSettings = () => {
    Linking.openSettings();
  };

  const LoadingView = () => {
    return (
      <View>
        {/* show the camera permissions status  */}
        <Text>
          Camera Permission:
          {cameraPermission}
        </Text>
        {/* loading indicator */}
        <Text>Loading...</Text>
      </View>
    );
  };

  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      const labels = labelImage(frame);
      // console.log('Labels:', labels);
      const currentLabelText = labels[0]?.label;

      console.log('currentLabel:', currentLabel.value);
      currentLabel.value = labels[0]?.label;
    },
    [currentLabel],
  );

  if (device == null) return <LoadingView />;
  return (
    <>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={showCamera}
        photo={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={3}
      />
      <>
        <Label sharedValue={currentLabel} />
      </>
      {/* <View
        style={{
          height: 100,
          width: '100%',
          backgroundColor: 'coral',
        }}>
        <Text>{currentLabel.value}</Text>
        <Label sharedValue={currentLabel} />
      </View> */}
    </>
  );
};

export default App;

const styles = StyleSheet.create({});
