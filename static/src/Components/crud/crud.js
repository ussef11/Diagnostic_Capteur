/** @odoo-module **/
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

const { Component, useState, onWillStart, useRef, useListener, onMounted  } =
  owl;
const rpc = require("web.rpc");

export class Crud extends Component {
  setup() {
    this.mapContainerRef = useRef("mapContainer");

    this.state = {
      name: "",
      value: 0,
      value2: 0,
      description: "",
      position: null, 

    };

    onMounted(() => {
      this.initMap();
  });

  }

  loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB-dn4yi8nZ8f8lMfQZNZ8AmEEVT07DEcE&libraries=places&region=ma`;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async initMap() {
    try {
      await this.loadGoogleMapsAPI();

      const {Map,Marker} = await window.google.maps.importLibrary("maps");

      const map = new Map(this.mapContainerRef.el, {
        center: { lat: 35.7444, lng: -5.800731 },
        zoom: 8
      });

      let position = [
      ];

      position.push(this.state.position)
      
      console.log("form mapfunc", position);
    position.forEach((markerList) => {
        markerList.forEach((item) => {
          const marker = new window.google.maps.Marker({
            position: { lat: parseFloat(item.lat), lng: parseFloat(item.lng) },
            map: map,
            icon: "http://localhost:8069/_a_test_app/static/src/Components/crud/bacmetal_vert.png",
            draggable:true

          });
      
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="o_kanban_record o_kanban_record_has_image_fill d-flex w-100">
                <h1 class='h1markername'> ${item.display_name}</h1>
              </div>
            `,
          });
      
          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
        });
      });
      
      
       

      
  
     

    }catch (error) {
      console.error("Failed to load Google Maps API:", error);
    }
  }


  onMounted() {
   
  }

  _updatename(e) {
    this.state.name = e.target.value;
  }
  _updateValue(e) {
    this.state.value = e.target.value;
  }
  _updateValue2(e) {
    this.state.value2 = e.target.value;
  }
  _updateDescription(e) {
    this.state.description = e.target.value;
  }

  async postData(name , value1 , value2 , description) {
    try {
      const result = await rpc.query({
        model: "_a_test_app._a_test_app",
        method: "create_new_record",
        args: [[], name, value1, value2, description],
      });

      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }


  async displayMap(){
    this.initMap();
  }

  async insertData() 
  {
    console.log(this.state.name);
    console.log(this.state.value);
    console.log(this.state.value2);
    console.log(this.state.description);
     await this.postData(this.state.name , this.state.value , this.state.value2 , this.state.description)
    
  }

  async FetchData() {
    var rpccall = rpc
      .query({
        model: "_a_test_app._a_test_app",
        method: "get_map_data",
        args: [[]],
      })
      .then(async function (result) {
        console.log(result);
      });
  }

  async updateData() {
    try {
      const result = await rpc.query({
        model: "_a_test_app._a_test_app",
        method: "update_vehicle_location",
        args: [[], 20000, 20000],
      });

      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }


  async get_map_data() {
    try {
      const result = await rpc.query({
        model: "fleet.vehicle",
        method: "get_map_data",
        args: [[]],
      });

      const position = [];
      

      result.forEach((item) => {
        if (item.latitude !== false && item.longitude !== false) {
          position.push({ lat : item.latitude , lng: item.longitude , display_name : item.display_name});
         
        }
      });

      // Update state with latitude and longitude arrays
      this.state.position = position;
    

      console.log(this.state.position)

      this.initMap()
    
    } catch (error) {
      console.error("Error fetching map data:", error);
    }
  }


}

Crud.template = "owl.Crud";
registry.category("actions").add("owl.action_Crud_js", Crud);
