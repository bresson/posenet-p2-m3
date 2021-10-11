import React, { useEffect, useState, useRef } from "react";
import logo from './logo.svg';
import './App.css';

import * as tf from '@tensorflow/tfjs';
import * as posenet from "@tensorflow-models/posenet";
import '@tensorflow/tfjs-backend-webgl';
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const [model, setModel] = useState(null);

  const poseEstimationLoop = useRef();

  const [isPoseEstimation, setIsPoseEstimation] = useState(false);
  
  const startPoseEstimation = async () => {
    console.log('startPoseEstimation')
    if (webcamRef.current) {
      console.log('webcamRef current')
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      const currTime = Date.now();
      // console.log(webcamRef)
      // console.log('model', model.estimateSinglePose(webcamRef))

      const poseestimate = await model.estimateSinglePose(video)
      // const pose = await posenet_model.estimateSinglePose(video);
      console.log('time', currTime);
      console.log('poseestimate', poseestimate)

    }
  }

  /**
   * More work to handle stopping stream:
   * 1. component dismounts -- handled as returned fn from useEffect
   * 2. isPoseEstimation === false; handled in useEffect but too many predicate checks and not rightly cohesive
   */
  const handlePoseEstimation = () => {
    if (isPoseEstimation) {
      setIsPoseEstimation(false)
    } else {
      setIsPoseEstimation(true)
    }
  }

  const stopPoseEstimation = (intervalId) => {
    // clear interval
    clearInterval(intervalId);
    // 
  }

  useEffect(() => {
    loadPosenet();
    // startPoseEstimation()

    return () => stopPoseEstimation(poseEstimationLoop.current);

  }, [])

  useEffect(() => {
    console.log('ISPOSEESTIMATION TRUE? ============= ', isPoseEstimation)
    if (model && isPoseEstimation) {
      poseEstimationLoop.current = setInterval(startPoseEstimation, 500)
    } else if (model && poseEstimationLoop.current && !isPoseEstimation) {
        stopPoseEstimation(poseEstimationLoop.current)
    }
  }, [model, isPoseEstimation])

  const loadPosenet = async () => {
    let loadedModel = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 800, height: 600 },
      multiplier: 0.75
    });

    setModel(loadedModel)
    console.log("Posenet Model Loaded..")
  };

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 800,
            height: 600,
          }}
        />
      </header>
      <button onClick={() => handlePoseEstimation()}>{isPoseEstimation ? 'Stop' : 'Start'}</button>
    </div>
  );
}

export default App;
