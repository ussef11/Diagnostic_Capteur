/** @odoo-module **/
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

const { Component, useState, onWillStart, useRef, useListener , onMounted } = owl;
const rpc = require('web.rpc');

export class TodoList extends Component {
  setup() {   
    
    this.cameraFeed = useRef("camera-feed");
    this.capturedImage = useRef("captured-image");
    this.capturedPreview = useRef("captured-preview");
    this.stopcam = useRef("stopcam");
    this.startcam = useRef("startcam");

    this.state = {    
      testsateat: "Initial Value",
      timer: 0,
      isTimerRunning: false,
      Iscamera:true
  };




  onMounted(() => {
    this.stopcam.el.style.display = "none";
  });

     

}

  
startTimer() {
  this.state.isTimerRunning = true;

  this.timerInterval = setInterval(() => {
      this.state.timer += 1;
      this.state.testsateat = this.state.timer.toString();
      this.render(); 
  }, 1000);

  console.log("Timer started", this.state.timer);
}

stopTimer() {
  this.state.isTimerRunning = false;

  clearInterval(this.timerInterval);
  this.render(); 
  console.log("Timer stopped");
}

handleStratTimer() {
  if (!this.state.isTimerRunning) {
      this.startTimer();
  }
  this.render(); 
  console.log(this.state.timer);
}




  async showcamera() {
    this.startcam.el.style.display = "none";
    this.stopcam.el.style.display = "initial";
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = {
          video: { facingMode: "user" },
      };
      navigator.mediaDevices
          .getUserMedia(constraints)
          .then((stream) => {
              const videoElement = this.cameraFeed.el;
              if (videoElement) {
                  videoElement.srcObject = stream;
              
                  videoElement.play();
              } else {
                  console.error("Video element not found.");
              }
          })
          .catch((error) => {
              console.error("Error accessing the camera:", error);
          });
  } else {
      console.error("getUserMedia is not supported in this environment.");
  }
  }

  async stopCamera() {
    this.startcam.el.style.display = "initial";
    this.stopcam.el.style.display = "none";
    
    const videoElement = this.cameraFeed.el;
    
    if (videoElement && videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        
        tracks.forEach((track) => {
            track.stop(); 
        });
        
        videoElement.srcObject = null;
    } else {
        console.error("Video element or srcObject not found.");
    }
}



async FetchData() {
  var rpccall =  rpc.query({
    model: '_a_test_app._a_test_app',
    method: 'get_map_data',
    args:[[]],
    }).then(async function(result) {
        console.log(result)  
    });
 } 

 async updateData() {
  try {
      const result = await rpc.query({
          model: '_a_test_app._a_test_app', 
          method: 'update_vehicle_location',
        args: [[],20000, 20000],
      });

      console.log(result);
  } catch (err) {
      console.error(err);
  }
}


async postData() {
  try {
      const result = await rpc.query({
          model: '_a_test_app._a_test_app',  
          method: 'create_new_record',
          args: [[],"New Record", 8000, 8000,"description"], 
      });

      console.log(result);
  }catch(err) {
      console.error(err);
  }
  
}






  usecamera() {
    try {
      if (this.capturedImage.el) {
        const context = this.capturedImage.el.getContext("2d");
        if (context) {
          context.drawImage(
            this.cameraFeed.el,
            0,
            0,
            this.capturedImage.el.width,
            this.capturedImage.el.height
          );
          // this.capturedImage.el.style.display = "block";
          this.capturedPreview.el.src =
            this.capturedImage.el.toDataURL("image/png");
          this.capturedPreview.el.style.display = "block";
        } else {
          console.error("Canvas context is null.");
        }
      } else {
        console.error("Captured image canvas is null.");
      }
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  }

  downloadImage() {
    const canvas = this.capturedImage.el;
    const dataURL = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "captured-image.png";
    link.click();
}


}



TodoList.template = "owl.TodoList";
registry.category("actions").add("owl.action_todolist_js", TodoList);
