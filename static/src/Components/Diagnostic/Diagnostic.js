/** @odoo-module **/
import { registry } from '@web/core/registry';
import { useService } from '@web/core/utils/hooks';

const { Component, useState, onWillStart, useRef, useListener, onMounted } = owl;
const rpc = require('web.rpc');

export class Diagnostic extends Component {
    setup() {
        this.jstreeRef = useRef('jstree');

        this.searchInputRef = useRef('searchInputRef');

        onMounted(() => {
            $(this.jstreeRef.el).jstree();
        });

        this.state = {
            name: '',
            value: 0,
            value2: 0,
            description: '',
            position: null,
            mychart: null,
            displayTree: true,
            height: 300,
            number: 5,
        };

        this.chartInstances = [];

        this.selectedNodes = [];

        this.mapContainerRef = useRef('mapContainer');

        this.state = {
            position: null,
        };

        onMounted(() => {
            this.LoadTree();

            const button = document.getElementById('mousEvent');

            button.addEventListener('mousedown', this.handler.bind(this));
            button.addEventListener('touchstart', this.handler.bind(this));

            const DisplayTree = document.getElementById('DisplayTree');
            DisplayTree.addEventListener('mousedown', this.handlerTree.bind(this));
            DisplayTree.addEventListener('touchstart', this.handlerTree.bind(this));

            this.initMap();
            this.Displaychart();
            document.getElementById('DisplayTree').style.marginLeft = '300px';
            // document.getElementById('DisplayTree').style.borderRadius = "6px 0px 0px 5px"
            this.loadLink(
                'stylesheet',
                'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
            );
        });
    }

    handler(mouseDownEvent) {
        const startHeight = document.getElementById('Chart').offsetHeight;
        const startPosition = {
            x:
                mouseDownEvent.pageX ||
                (mouseDownEvent.touches && mouseDownEvent.touches[0].pageX),
            y:
                mouseDownEvent.pageY ||
                (mouseDownEvent.touches && mouseDownEvent.touches[0].pageY),
        };

        function onMouseMove(mouseMoveEvent) {
            const currentPosition = {
                x:
                    mouseMoveEvent.pageX ||
                    (mouseMoveEvent.touches && mouseMoveEvent.touches[0].pageX),
                y:
                    mouseMoveEvent.pageY ||
                    (mouseMoveEvent.touches && mouseMoveEvent.touches[0].pageY),
            };

            const newHeight = startHeight - (currentPosition.y - startPosition.y);
            let Chart = document.getElementById('Chart');
            Chart.style.height = `${newHeight}px`;
            // Chart.style.minHeight = `${newHeight}px`;
            console.log(newHeight);
        }

        function onMouseUp() {
            document.body.removeEventListener('mousemove', onMouseMove);
            document.body.removeEventListener('touchmove', onMouseMove);
            document.body.removeEventListener('mouseup', onMouseUp);
            document.body.removeEventListener('touchend', onMouseUp);
        }

        document.body.addEventListener('mousemove', onMouseMove);
        document.body.addEventListener('touchmove', onMouseMove, { passive: false });
        document.body.addEventListener('mouseup', onMouseUp, { once: true });
        document.body.addEventListener('touchend', onMouseUp, { once: true });
    }

    handlerTree(mouseDownEvent) {
        const startButtonTree = document.getElementById('DisplayTree').offsetTop;

        const startPosition = {
            x:
                mouseDownEvent.pageX ||
                (mouseDownEvent.touches && mouseDownEvent.touches[0].pageX),
            y:
                mouseDownEvent.pageY ||
                (mouseDownEvent.touches && mouseDownEvent.touches[0].pageY),
        };

        function onMouseMove(mouseMoveEvent) {
            const currentPosition = {
                x:
                    mouseMoveEvent.pageX ||
                    (mouseMoveEvent.touches && mouseMoveEvent.touches[0].pageX),
                y:
                    mouseMoveEvent.pageY ||
                    (mouseMoveEvent.touches && mouseMoveEvent.touches[0].pageY),
            };

            const newHeightButtonTree =
                startButtonTree - (startPosition.y - currentPosition.y);

            document.getElementById(
                'DisplayTree'
            ).style.top = `${newHeightButtonTree}px`;

            // Chart.style.minHeight = `${newHeight}px`;
        }

        function onMouseUp() {
            document.body.removeEventListener('mousemove', onMouseMove);
            document.body.removeEventListener('touchmove', onMouseMove);
            document.body.removeEventListener('mouseup', onMouseUp);
            document.body.removeEventListener('touchend', onMouseUp);
        }

        document.body.addEventListener('mousemove', onMouseMove);
        document.body.addEventListener('touchmove', onMouseMove, { passive: false });
        document.body.addEventListener('mouseup', onMouseUp, { once: true });
        document.body.addEventListener('touchend', onMouseUp, { once: true });
    }

    DisplayTree() {
        if (this.state.displayTree === true) {
            document.getElementById('TreeDiag').style.display = 'initial';
            document.getElementById('DisplayTree').style.marginLeft = '300px';
            // document.getElementById('DisplayTree').style.borderRadius = "6px 0px 0px 5px"
            this.state.displayTree = !this.state.displayTree;
        } else {
            document.getElementById('TreeDiag').style.display = 'none';
            document.getElementById('DisplayTree').style.marginLeft = '0';
            // document.getElementById('DisplayTree').style.borderRadius = "0px 5px 5px 0px"
            this.state.displayTree = !this.state.displayTree;
        }
    }

    async loadLink(rel, href) {
        return new Promise((resolve, reject) => {
            const Link = document.createElement('link');
            Link.rel = rel;
            Link.href = href;
            Link.onload = resolve;
            Link.onerror = reject;
            document.body.appendChild(Link);
        });
    }
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;

            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
    async loadScriptchart(src, integrity) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;

            script.integrity = integrity;
            script.crossOrigin = 'anonymous';
            script.referrerPolicy = 'no-referrer';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    //   <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.3"></script>
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js" integrity="sha512-UXumZrZNiOwnTcZSHLOfcTs0aos2MzBWHXOHOuB0J/R44QB0dwY5JgfbvljXcklVf65Gc4El6RjZ+lnwd2az2g==" crossorigin="anonymous"></script>
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-zoom/0.7.7/chartjs-plugin-zoom.js" integrity="sha512-qeclqxc+2KW7GtbmHcj/Ev5eBoYpPnuAcPqusYRIfvaC9OWHlDwu1BrIVPYvfNDG+SRIRiPIokiSvhlLJXDqsw==" crossorigin="anonymous"></script>
    async loadScriptMounted() {
        await this.loadScript(
            '/_a_test_app/static/src/Components/Diagnostic/dist/tree.min.js'
        );
        await this.loadScript(
            'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.1/jquery.min.js'
        );
        await this.loadScript(
            'https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/jstree.min.js'
        );

        await this.loadScript(
            `https://maps.googleapis.com/maps/api/js?key=AIzaSyB-dn4yi8nZ8f8lMfQZNZ8AmEEVT07DEcE&libraries=places&region=ma`
        );
        await this.loadScript(`https://cdn.jsdelivr.net/npm/chart.js`);
        await this.loadScript(`https://cdn.jsdelivr.net/npm/hammerjs@2.0.8`);

        await this.loadScriptchart(
            `https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-zoom/2.0.1/chartjs-plugin-zoom.min.js`,
            'sha512-wUYbRPLV5zs6IqvWd88HIqZU/b8TBx+I8LEioQ/UC0t5EMCLApqhIAnUg7EsAzdbhhdgW07TqYDdH3QEXRcPOQ=='
        );
    }

    async initMap() {
        try {
            await this.loadScriptMounted();
            await this.get_map_data();

            const { Map, Marker } = await window.google.maps.importLibrary('maps');

            const map = new Map(this.mapContainerRef.el, {
                center: { lat: 35.7444, lng: -5.800731 },
                zoom: 8,
            });

            let position = [];

            position.push(this.state.position);

            console.log('Position ', position);
            position &&
                position.forEach((markerList) => {
                    markerList.forEach((item) => {
                        const marker = new window.google.maps.Marker({
                            position: {
                                lat: parseFloat(item.lat),
                                lng: parseFloat(item.lng),
                            },
                            map: map,
                            icon: 'http://localhost:8069/_a_test_app/static/src/Components/crud/bacmetal_vert.png',
                            draggable: true,
                        });

                        const infoWindow = new window.google.maps.InfoWindow({
                            content: `
              <div class="o_kanban_record o_kanban_record_has_image_fill d-flex w-100">
                <h1 class='h1markername'> ${item.display_name}</h1>
              </div>
            `,
                        });

                        marker.addListener('click', () => {
                            infoWindow.open(map, marker);
                        });
                    });
                });
        } catch (error) {
            console.error('Failed to load Google Maps API:', error);
        }
    }

    async get_map_data() {
        try {
            const result = await rpc.query({
                model: 'fleet.vehicle',
                method: 'get_map_data',
                args: [[]],
            });

            const position = [];

            result.forEach((item) => {
                if (item.latitude !== false && item.longitude !== false) {
                    position.push({
                        lat: item.latitude,
                        lng: item.longitude,
                        display_name: item.display_name,
                    });
                }
            });

            this.state.position = position;

            console.log(this.state.position);
        } catch (error) {
            console.error('Error fetching map data:', error);
        }
    }

    async LoadTree() {
        try {
            await this.loadScriptMounted();
            const vehicles = [
                {
                    id: 252,
                    device: 'ARER3701',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [73, 'Laveuse colonnes'],
                },
                {
                    id: 256,
                    device: '4-018462',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 34,
                    device: 'ARER4109',
                    latitude: 33.984737,
                    longitude: -6.825117,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 40,
                    device: 'ARER4108',
                    latitude: 33.986343,
                    longitude: -6.816312,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 42,
                    device: 'ARER4102',
                    latitude: 34.005245,
                    longitude: -6.852477,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 107,
                    device: 'ARER6102',
                    latitude: 33.991917,
                    longitude: -6.79956,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 50,
                    device: 'ARER4101',
                    latitude: 33.991894,
                    longitude: -6.79966,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 52,
                    device: 'ARER4106',
                    latitude: 33.991955,
                    longitude: -6.799437,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 33,
                    device: 'ARER4110',
                    latitude: 33.980343,
                    longitude: -6.822251,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 87,
                    device: 'ARER1112',
                    latitude: 33.985573,
                    longitude: -6.869365,
                    vehicle_group_id: [69, 'Voitures'],
                },
                {
                    id: 30,
                    device: 'ARER5313',
                    latitude: 33.99255,
                    longitude: -6.799583,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 114,
                    device: 'ARER6305',
                    latitude: 33.991886,
                    longitude: -6.799228,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 57,
                    device: 'ARER5312',
                    latitude: 33.992329,
                    longitude: -6.79938,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 115,
                    device: 'ARER6306',
                    latitude: 33.992241,
                    longitude: -6.799577,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 108,
                    device: 'ARER6304',
                    latitude: 33.9655,
                    longitude: -6.855535,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 133,
                    device: 'ARER6308',
                    latitude: 34.000675,
                    longitude: -6.816568,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 117,
                    device: 'ARER6307',
                    latitude: 33.992184,
                    longitude: -6.799865,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 122,
                    device: 'ARER6303',
                    latitude: 33.987751,
                    longitude: -6.803655,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 60,
                    device: 'ARER5310',
                    latitude: 33.945332,
                    longitude: -6.871193,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 29,
                    device: 'ARER5311',
                    latitude: 33.992287,
                    longitude: -6.799893,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 56,
                    device: 'ARER5314',
                    latitude: 33.957146,
                    longitude: -6.879903,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 92,
                    device: 'ARER6202',
                    latitude: 33.942825,
                    longitude: -6.786665,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 118,
                    device: 'ARER6201',
                    latitude: 33.945564,
                    longitude: -6.865027,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 32,
                    device: 'ARER5102',
                    latitude: 33.992275,
                    longitude: -6.79949,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 31,
                    device: 'ARER5103',
                    latitude: 33.991688,
                    longitude: -6.799674,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 41,
                    device: 'ARER5104',
                    latitude: 33.992065,
                    longitude: -6.799018,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 125,
                    device: 'ARER6104',
                    latitude: 33.986988,
                    longitude: -6.80329,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 47,
                    device: 'ARER5101',
                    latitude: 33.941757,
                    longitude: -6.787502,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 43,
                    device: 'ARER5201',
                    latitude: 33.992428,
                    longitude: -6.799277,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 197,
                    device: 'ARER6103',
                    latitude: 33.990559,
                    longitude: -6.797355,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 59,
                    device: 'ARER4202',
                    latitude: 33.992542,
                    longitude: -6.799522,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 196,
                    device: 'ARER8201-OLD',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 135,
                    device: 'ARER4402',
                    latitude: 33.992081,
                    longitude: -6.799355,
                    vehicle_group_id: [60, 'Transfert'],
                },
                {
                    id: 134,
                    device: 'ARER4401',
                    latitude: 33.992134,
                    longitude: -6.799605,
                    vehicle_group_id: [60, 'Transfert'],
                },
                {
                    id: 109,
                    device: 'ARER3501',
                    latitude: 34.013062,
                    longitude: -6.841139,
                    vehicle_group_id: [72, 'Laveuse de voirie'],
                },
                {
                    id: 102,
                    device: 'ARER4201',
                    latitude: 33.988705,
                    longitude: -6.819447,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 61,
                    device: 'ARER6301',
                    latitude: 33.992233,
                    longitude: -6.799676,
                    vehicle_group_id: [63, 'Grue'],
                },
                {
                    id: 62,
                    device: 'ARER6302',
                    latitude: 33.993839,
                    longitude: -6.816225,
                    vehicle_group_id: [63, 'Grue'],
                },
                {
                    id: 45,
                    device: 'ARER5303',
                    latitude: 33.991039,
                    longitude: -6.812803,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 28,
                    device: 'ARER5306',
                    latitude: 33.989208,
                    longitude: -6.794342,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 53,
                    device: 'ARER5307',
                    latitude: 33.910671,
                    longitude: -6.837863,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 54,
                    device: 'ARER5308',
                    latitude: 33.992016,
                    longitude: -6.799849,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 27,
                    device: 'ARER5305',
                    latitude: 34.003582,
                    longitude: -6.852363,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 38,
                    device: 'ARER5304',
                    latitude: 33.934063,
                    longitude: -6.804992,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 26,
                    device: 'ARER5309',
                    latitude: 33.995464,
                    longitude: -6.850383,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 121,
                    device: 'ARER5302',
                    latitude: 33.993431,
                    longitude: -6.789957,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 88,
                    device: 'ARER3302',
                    latitude: 34.008934,
                    longitude: -6.853293,
                    vehicle_group_id: [70, 'Balayage Mecanique'],
                },
                {
                    id: 84,
                    device: 'ARER3301',
                    latitude: 33.993328,
                    longitude: -6.836962,
                    vehicle_group_id: [70, 'Balayage Mecanique'],
                },
                {
                    id: 85,
                    device: 'ARER3603',
                    latitude: 33.992119,
                    longitude: -6.799867,
                    vehicle_group_id: [65, 'Laveuse de bacs'],
                },
                {
                    id: 58,
                    device: 'ARER3602',
                    latitude: 33.992264,
                    longitude: -6.799538,
                    vehicle_group_id: [65, 'Laveuse de bacs'],
                },
                {
                    id: 103,
                    device: 'ARER3601',
                    latitude: 33.992001,
                    longitude: -6.79966,
                    vehicle_group_id: [65, 'Laveuse de bacs'],
                },
                {
                    id: 79,
                    device: 'ARER1108',
                    latitude: 33.968529,
                    longitude: -6.847587,
                    vehicle_group_id: [69, 'Voitures'],
                },
                {
                    id: 71,
                    device: 'ARER1105',
                    latitude: 33.825512,
                    longitude: -6.941615,
                    vehicle_group_id: [69, 'Voitures'],
                },
                {
                    id: 80,
                    device: 'ARER1106',
                    latitude: 33.956543,
                    longitude: -6.835652,
                    vehicle_group_id: [69, 'Voitures'],
                },
                {
                    id: 75,
                    device: 'ARER1111',
                    latitude: 34.000591,
                    longitude: -6.816678,
                    vehicle_group_id: [69, 'Voitures'],
                },
                {
                    id: 77,
                    device: 'ARER1109',
                    latitude: 33.98085,
                    longitude: -6.821317,
                    vehicle_group_id: [69, 'Voitures'],
                },
                {
                    id: 83,
                    device: 'ARER1110',
                    latitude: 34.025051,
                    longitude: -6.760753,
                    vehicle_group_id: [69, 'Voitures'],
                },
                {
                    id: 78,
                    device: 'ARER1107',
                    latitude: 33.991413,
                    longitude: -6.799305,
                    vehicle_group_id: [69, 'Voitures'],
                },

                {
                    id: 97,
                    device: 'ARER1207',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [68, 'Moto de service'],
                },

                {
                    id: 68,
                    device: 'ARER1226',
                    latitude: 33.946541,
                    longitude: -6.869682,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 120,
                    device: 'ARER1223',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 94,
                    device: 'ARER1205',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 65,
                    device: '401964',
                    latitude: 33.990295,
                    longitude: -6.81214,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 95,
                    device: 'ARER1224',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 96,
                    device: 'ARER1217',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 67,
                    device: '401980',
                    latitude: 33.97052,
                    longitude: -6.819972,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 93,
                    device: 'ARER1228',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 66,
                    device: '401991',
                    latitude: 34.007019,
                    longitude: -6.857988,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 70,
                    device: 'ARER1219',
                    latitude: 33.991581,
                    longitude: -6.799675,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 63,
                    device: '402115',
                    latitude: 33.989262,
                    longitude: -6.817923,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 128,
                    device: 'ARER1201',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 82,
                    device: 'ARER1212',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 198,
                    device: '402156',
                    latitude: 33.99168,
                    longitude: -6.799775,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 86,
                    device: 'ARER1209',
                    latitude: 33.991714,
                    longitude: -6.799739,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 124,
                    device: '402173',
                    latitude: 33.999901,
                    longitude: -6.872554,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 76,
                    device: 'WWW116576',
                    latitude: 33.972839,
                    longitude: -6.817346,
                    vehicle_group_id: [69, 'Voitures'],
                },
                {
                    id: 112,
                    device: 'WWW116582-OLD',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 185,
                    device: 'ARER9351',
                    latitude: 33.991573,
                    longitude: -6.799955,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 186,
                    device: 'ARER9079',
                    latitude: 33.99139,
                    longitude: -6.799833,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 205,
                    device: 'ARER9088',
                    latitude: 33.991402,
                    longitude: -6.79992,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 204,
                    device: 'ARER9087',
                    latitude: 33.991497,
                    longitude: -6.799968,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 199,
                    device: 'ARER9084',
                    latitude: 33.991501,
                    longitude: -6.799901,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 188,
                    device: 'ARER9081',
                    latitude: 33.991493,
                    longitude: -6.799835,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 290,
                    device: 'ARER9333',
                    latitude: 33.964531,
                    longitude: -6.842195,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 277,
                    device: 'ARER9321',
                    latitude: 33.927883,
                    longitude: -6.792954,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 283,
                    device: 'ARER9327',
                    latitude: 33.991501,
                    longitude: -6.799855,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 287,
                    device: 'ARER9330',
                    latitude: 33.99147,
                    longitude: -6.799919,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 288,
                    device: 'ARER9331',
                    latitude: 33.991421,
                    longitude: -6.799885,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 280,
                    device: 'ARER9324',
                    latitude: 33.991528,
                    longitude: -6.799925,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 282,
                    device: 'ARER9326',
                    latitude: 33.991306,
                    longitude: -6.799917,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 293,
                    device: 'ARER9336',
                    latitude: 33.991428,
                    longitude: -6.799882,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 278,
                    device: 'ARER9322',
                    latitude: 33.991417,
                    longitude: -6.799911,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 279,
                    device: 'ARER9323',
                    latitude: 33.99157,
                    longitude: -6.799799,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 291,
                    device: 'ARER9604',
                    latitude: 33.992306,
                    longitude: -6.858571,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 260,
                    device: 'ARER9304',
                    latitude: 33.991463,
                    longitude: -6.799917,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 269,
                    device: 'ARER9313',
                    latitude: 33.99144,
                    longitude: -6.800036,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 262,
                    device: 'ARER9306',
                    latitude: 33.991474,
                    longitude: -6.799882,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 257,
                    device: 'ARER9301',
                    latitude: 33.991474,
                    longitude: -6.799919,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 300,
                    device: 'ARER9342',
                    latitude: 33.991413,
                    longitude: -6.799873,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 301,
                    device: 'ARER9602',
                    latitude: 34.001476,
                    longitude: -6.847089,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 336,
                    device: 'ARER9614',
                    latitude: 33.96014,
                    longitude: -6.867251,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 303,
                    device: 'ARER9601',
                    latitude: 33.991558,
                    longitude: -6.799914,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 344,
                    device: 'ARER9387',
                    latitude: 33.991467,
                    longitude: -6.799802,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 342,
                    device: 'ARER9406',
                    latitude: 33.991428,
                    longitude: -6.799911,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 311,
                    device: 'ARER9355',
                    latitude: 33.991447,
                    longitude: -6.799943,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 322,
                    device: 'ARER9366',
                    latitude: 33.991333,
                    longitude: -6.799892,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 308,
                    device: 'ARER9352',
                    latitude: 33.99139,
                    longitude: -6.79987,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 305,
                    device: 'ARER9349',
                    latitude: 33.991478,
                    longitude: -6.799955,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 324,
                    device: 'ARER9368',
                    latitude: 33.991493,
                    longitude: -6.799849,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 309,
                    device: 'ARER9353',
                    latitude: 33.991436,
                    longitude: -6.79999,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 313,
                    device: 'ARER9357',
                    latitude: 33.991405,
                    longitude: -6.799809,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 318,
                    device: 'ARER9362',
                    latitude: 33.991196,
                    longitude: -6.799672,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 307,
                    device: 'ARER9078',
                    latitude: 33.991333,
                    longitude: -6.799893,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 339,
                    device: 'BAL030',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 326,
                    device: 'ARER9370OLD',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 91,
                    device: 'ARER1220',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 44,
                    device: 'ARER4104',
                    latitude: 33.991924,
                    longitude: -6.799563,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 382,
                    device: 'ARER6101',
                    latitude: 33.991917,
                    longitude: -6.799736,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 400,
                    device: 'ARER5301',
                    latitude: 33.952007,
                    longitude: -6.85391,
                    vehicle_group_id: [61, 'Bom'],
                },
                {
                    id: 111,
                    device: 'RC51',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 49,
                    device: 'RA002-ARER8301OLD',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 380,
                    device: 'ARER5302OLD',
                    latitude: 33.991131,
                    longitude: -6.799658,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 99,
                    device: 'RC40',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 74,
                    device: 'RC16',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 69,
                    device: 'ARER1229-OLD',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 119,
                    device: 'RC59',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 98,
                    device: 'RC45',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 373,
                    device: 'ARER3501OLD4',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 383,
                    device: 'ARER6202OLD',
                    latitude: 33.991276,
                    longitude: -6.79973,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 385,
                    device: 'ARER6103OLD',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 401,
                    device: 'TRIPORTEUR01',
                    latitude: 33.992191,
                    longitude: -6.79975,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 384,
                    device: 'ARER6304OLD',
                    latitude: 33.990963,
                    longitude: -6.799958,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 386,
                    device: 'ARER6308OLD',
                    latitude: 33.991272,
                    longitude: -6.79969,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 399,
                    device: 'ARER5301OLD',
                    latitude: 33.991299,
                    longitude: -6.799553,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 113,
                    device: 'RC06',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 101,
                    device: 'ARER3303',
                    latitude: 33.952324,
                    longitude: -6.823988,
                    vehicle_group_id: [70, 'Balayage Mecanique'],
                },
                {
                    id: 157,
                    device: 'ARER9332',
                    latitude: 33.991482,
                    longitude: -6.799872,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 285,
                    device: 'ARER9328',
                    latitude: 33.991459,
                    longitude: -6.799948,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 284,
                    device: 'ARER9343',
                    latitude: 33.991367,
                    longitude: -6.799901,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 276,
                    device: 'ARER9606',
                    latitude: 34.009705,
                    longitude: -6.849492,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 375,
                    device: 'ARER9605',
                    latitude: 33.99242,
                    longitude: -6.858425,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 376,
                    device: 'ARER9607',
                    latitude: 34.002304,
                    longitude: -6.850975,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 379,
                    device: 'ARER9609',
                    latitude: 33.99728,
                    longitude: -6.84617,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 378,
                    device: 'ARER9611',
                    latitude: 33.981861,
                    longitude: -6.857393,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 377,
                    device: 'ARER9610',
                    latitude: 34.020615,
                    longitude: -6.840103,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 310,
                    device: 'ARER9615',
                    latitude: 33.96516,
                    longitude: -6.863032,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 270,
                    device: 'ARER9608',
                    latitude: 33.999744,
                    longitude: -6.849794,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 265,
                    device: 'ARER9309',
                    latitude: 33.991474,
                    longitude: -6.79992,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 274,
                    device: 'ARER9318',
                    latitude: 33.991512,
                    longitude: -6.799924,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 147,
                    device: 'ARER9308',
                    latitude: 33.991505,
                    longitude: -6.79999,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 266,
                    device: 'ARER9310',
                    latitude: 33.991505,
                    longitude: -6.799873,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 268,
                    device: 'ARER9312',
                    latitude: 33.991409,
                    longitude: -6.799924,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 144,
                    device: 'ARER9314',
                    latitude: 33.991512,
                    longitude: -6.799911,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 263,
                    device: 'ARER9307',
                    latitude: 33.991611,
                    longitude: -6.80005,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 261,
                    device: 'ARER9305',
                    latitude: 33.99152,
                    longitude: -6.799917,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 271,
                    device: 'ARER9315',
                    latitude: 33.991447,
                    longitude: -6.799885,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 259,
                    device: 'ARER9303',
                    latitude: 33.991508,
                    longitude: -6.799888,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 239,
                    device: 'ARER9404',
                    latitude: 33.991455,
                    longitude: -6.799878,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 240,
                    device: 'ARER9405',
                    latitude: 33.991444,
                    longitude: -6.799917,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 150,
                    device: 'ARER9385',
                    latitude: 33.991367,
                    longitude: -6.799805,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 171,
                    device: 'ARER9390',
                    latitude: 33.991375,
                    longitude: -6.79983,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 232,
                    device: 'ARER9400',
                    latitude: 33.991436,
                    longitude: -6.799823,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 226,
                    device: 'ARER9396',
                    latitude: 33.991463,
                    longitude: -6.799822,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 345,
                    device: 'ARER9407',
                    latitude: 33.991436,
                    longitude: -6.800029,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 238,
                    device: 'ARER9403',
                    latitude: 33.99147,
                    longitude: -6.799887,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 312,
                    device: 'ARER9356',
                    latitude: 33.991501,
                    longitude: -6.799911,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 306,
                    device: 'ARER9350',
                    latitude: 33.991322,
                    longitude: -6.799849,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 316,
                    device: 'ARER9360',
                    latitude: 33.991497,
                    longitude: -6.799859,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 321,
                    device: 'ARER9365',
                    latitude: 33.99147,
                    longitude: -6.799878,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 319,
                    device: 'ARER9363',
                    latitude: 33.991463,
                    longitude: -6.79996,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 302,
                    device: 'ARER9346',
                    latitude: 33.991428,
                    longitude: -6.799913,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 320,
                    device: 'ARER9364',
                    latitude: 33.991394,
                    longitude: -6.799955,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 175,
                    device: 'ARER9347',
                    latitude: 33.99139,
                    longitude: -6.79987,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 317,
                    device: 'ARER9361',
                    latitude: 33.991501,
                    longitude: -6.799985,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 153,
                    device: 'ARER9345',
                    latitude: 33.991417,
                    longitude: -6.799857,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 304,
                    device: 'ARER9348',
                    latitude: 33.991463,
                    longitude: -6.799875,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 208,
                    device: 'ARER9091',
                    latitude: 33.991386,
                    longitude: -6.799827,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 156,
                    device: 'ARER9090',
                    latitude: 33.991394,
                    longitude: -6.79984,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 206,
                    device: 'ARER9089',
                    latitude: 33.991261,
                    longitude: -6.799873,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 190,
                    device: 'ARER9082',
                    latitude: 33.991428,
                    longitude: -6.79988,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 366,
                    device: 'ARER9093',
                    latitude: 33.99139,
                    longitude: -6.799947,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 209,
                    device: 'ARER9092',
                    latitude: 33.991447,
                    longitude: -6.799911,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 201,
                    device: 'ARER9086',
                    latitude: 33.991417,
                    longitude: -6.799836,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 367,
                    device: 'ARER9094',
                    latitude: 33.991398,
                    longitude: -6.799911,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 363,
                    device: 'ARER9075',
                    latitude: 33.991497,
                    longitude: -6.79988,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 245,
                    device: 'ARER9070',
                    latitude: 33.991409,
                    longitude: -6.799873,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 210,
                    device: 'ARER9061',
                    latitude: 33.962013,
                    longitude: -6.855417,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 233,
                    device: 'ARER9064',
                    latitude: 33.991386,
                    longitude: -6.799984,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 237,
                    device: 'ARER9065',
                    latitude: 33.991577,
                    longitude: -6.799917,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 364,
                    device: 'ARER9076',
                    latitude: 33.991432,
                    longitude: -6.79987,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 365,
                    device: 'ARER9077',
                    latitude: 33.991436,
                    longitude: -6.79992,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 211,
                    device: 'ARER9062',
                    latitude: 33.99139,
                    longitude: -6.799984,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 216,
                    device: 'ARER9063',
                    latitude: 33.991417,
                    longitude: -6.799872,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 246,
                    device: 'ARER9071',
                    latitude: 33.991421,
                    longitude: -6.799901,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 244,
                    device: 'ARER9069',
                    latitude: 33.991409,
                    longitude: -6.799917,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 242,
                    device: 'ARER9067',
                    latitude: 33.991478,
                    longitude: -6.799913,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 248,
                    device: 'ARER9073',
                    latitude: 33.991508,
                    longitude: -6.799927,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 243,
                    device: 'ARER9068',
                    latitude: 33.991344,
                    longitude: -6.799864,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 247,
                    device: 'ARER9072',
                    latitude: 33.991402,
                    longitude: -6.799845,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 241,
                    device: 'ARER9066',
                    latitude: 33.991493,
                    longitude: -6.799893,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 359,
                    device: 'ARER9039',
                    latitude: 33.991375,
                    longitude: -6.799846,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 249,
                    device: 'ARER9024',
                    latitude: 34.000923,
                    longitude: -6.855764,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 347,
                    device: 'ARER9027',
                    latitude: 33.99123,
                    longitude: -6.799905,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 349,
                    device: 'ARER9029',
                    latitude: 33.99229,
                    longitude: -6.858699,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 358,
                    device: 'ARER9038',
                    latitude: 33.991482,
                    longitude: -6.799973,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 350,
                    device: 'ARER9030',
                    latitude: 33.991348,
                    longitude: -6.799828,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 353,
                    device: 'ARER9033',
                    latitude: 33.99152,
                    longitude: -6.799867,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 348,
                    device: 'ARER9028',
                    latitude: 33.991386,
                    longitude: -6.799794,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 356,
                    device: 'ARER9036',
                    latitude: 33.991501,
                    longitude: -6.799787,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 357,
                    device: 'ARER9037',
                    latitude: 33.99136,
                    longitude: -6.799887,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 355,
                    device: 'ARER9035',
                    latitude: 33.991344,
                    longitude: -6.799882,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 352,
                    device: 'ARER9032',
                    latitude: 33.991409,
                    longitude: -6.799867,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 354,
                    device: 'ARER9034',
                    latitude: 33.991447,
                    longitude: -6.799901,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 351,
                    device: 'ARER9031',
                    latitude: 33.991459,
                    longitude: -6.799943,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 361,
                    device: 'ARER9040',
                    latitude: 33.991447,
                    longitude: -6.799905,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 250,
                    device: 'ARER9025',
                    latitude: 33.991432,
                    longitude: -6.799914,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 251,
                    device: 'ARER9026',
                    latitude: 33.991436,
                    longitude: -6.799903,
                    vehicle_group_id: [84, 'S2'],
                },
                {
                    id: 35,
                    device: 'RASC011',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 36,
                    device: 'RASC012',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 37,
                    device: 'RASC013',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 39,
                    device: 'RAS015',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 55,
                    device: 'RAS030',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 104,
                    device: 'RAS046',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 106,
                    device: 'RAS048',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 105,
                    device: 'RAS047',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 72,
                    device: 'RAS035-ARER4101OLD',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 368,
                    device: 'ARER4106-TESTING',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 389,
                    device: 'ARER3701OLD',
                    latitude: 33.991257,
                    longitude: -6.799788,
                    vehicle_group_id: [58, 'TracBac'],
                },
                {
                    id: 398,
                    device: 'TR08',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 346,
                    device: 'ARER5309-OLD',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 360,
                    device: 'BAL236',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 374,
                    device: 'TESTRABAT',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 369,
                    device: 'B182',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 397,
                    device: 'ARER9610OLD',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 391,
                    device: 'TR02',
                    latitude: 33.991203,
                    longitude: -6.799747,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 390,
                    device: 'TR01',
                    latitude: 33.991325,
                    longitude: -6.799765,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 395,
                    device: 'TR06',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 396,
                    device: 'TR07',
                    latitude: 33.991199,
                    longitude: -6.799723,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 392,
                    device: 'TR03',
                    latitude: 33.991283,
                    longitude: -6.799665,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 394,
                    device: 'TR05',
                    latitude: 33.991306,
                    longitude: -6.79971,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 264,
                    device: 'BAL012',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 289,
                    device: 'BAL022',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 315,
                    device: 'BAL008',
                    latitude: 33.99124,
                    longitude: -6.799666,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 393,
                    device: 'TR04',
                    latitude: 33.99123,
                    longitude: -6.799695,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 381,
                    device: 'ARER6307OLD',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: false,
                },
                {
                    id: 337,
                    device: 'ARER9381',
                    latitude: 33.991394,
                    longitude: -6.799888,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 207,
                    device: 'ARER9380',
                    latitude: 33.991501,
                    longitude: -6.799951,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 334,
                    device: 'ARER9378',
                    latitude: 33.991459,
                    longitude: -6.799932,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 370,
                    device: 'ARER9370',
                    latitude: 33.991394,
                    longitude: -6.799734,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 165,
                    device: 'ARER9383',
                    latitude: 33.991386,
                    longitude: -6.799906,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 338,
                    device: 'ARER9382',
                    latitude: 33.991489,
                    longitude: -6.799813,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 332,
                    device: 'ARER9376',
                    latitude: 33.991417,
                    longitude: -6.799817,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 330,
                    device: 'ARER9374',
                    latitude: 33.991352,
                    longitude: -6.799832,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 340,
                    device: 'ARER9384',
                    latitude: 33.99147,
                    longitude: -6.799906,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 331,
                    device: 'ARER9375',
                    latitude: 33.991291,
                    longitude: -6.799718,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 333,
                    device: 'ARER9377',
                    latitude: 33.991428,
                    longitude: -6.79988,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 335,
                    device: 'ARER9379',
                    latitude: 33.99144,
                    longitude: -6.799835,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 329,
                    device: 'ARER9373',
                    latitude: 33.991428,
                    longitude: -6.799817,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 325,
                    device: 'ARER9369',
                    latitude: 33.991413,
                    longitude: -6.799914,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 327,
                    device: 'ARER9371',
                    latitude: 33.991447,
                    longitude: -6.799857,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 328,
                    device: 'ARER9372',
                    latitude: 33.991447,
                    longitude: -6.799942,
                    vehicle_group_id: [80, 'S4'],
                },
                {
                    id: 179,
                    device: 'ARER9010',
                    latitude: 33.991444,
                    longitude: -6.799901,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 217,
                    device: 'ARER9023',
                    latitude: 33.991447,
                    longitude: -6.799898,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 173,
                    device: 'ARER9005',
                    latitude: 33.991463,
                    longitude: -6.799882,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 181,
                    device: 'ARER9015',
                    latitude: 33.991417,
                    longitude: -6.799914,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 236,
                    device: 'ARER9014',
                    latitude: 33.991306,
                    longitude: -6.799922,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 178,
                    device: 'ARER9004',
                    latitude: 33.991367,
                    longitude: -6.799762,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 154,
                    device: 'ARER9018',
                    latitude: 33.991386,
                    longitude: -6.799875,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 163,
                    device: 'ARER9009',
                    latitude: 34.004696,
                    longitude: -6.849113,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 137,
                    device: 'ARER9001',
                    latitude: 33.991455,
                    longitude: -6.799872,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 152,
                    device: 'ARER9008',
                    latitude: 33.991428,
                    longitude: -6.799911,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 146,
                    device: 'ARER9006',
                    latitude: 33.991444,
                    longitude: -6.799924,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 138,
                    device: 'ARER9002',
                    latitude: 33.991463,
                    longitude: -6.799933,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 148,
                    device: 'ARER9012',
                    latitude: 33.991505,
                    longitude: -6.799885,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 162,
                    device: 'ARER9021',
                    latitude: 33.991451,
                    longitude: -6.799875,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 192,
                    device: 'ARER9016',
                    latitude: 33.991463,
                    longitude: -6.799896,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 218,
                    device: 'ARER9019',
                    latitude: 33.991428,
                    longitude: -6.799963,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 191,
                    device: 'ARER9000',
                    latitude: 33.991432,
                    longitude: -6.800015,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 230,
                    device: 'ARER9007',
                    latitude: 33.991573,
                    longitude: -6.799804,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 228,
                    device: 'ARER9022',
                    latitude: 33.991497,
                    longitude: -6.799799,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 215,
                    device: 'ARER9013',
                    latitude: 33.991344,
                    longitude: -6.79985,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 180,
                    device: 'ARER9048',
                    latitude: 33.991493,
                    longitude: -6.79998,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 172,
                    device: 'ARER9045',
                    latitude: 33.991238,
                    longitude: -6.799728,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 225,
                    device: 'ARER9060',
                    latitude: 33.991528,
                    longitude: -6.799905,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 174,
                    device: 'ARER9041',
                    latitude: 33.991398,
                    longitude: -6.799895,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 145,
                    device: 'ARER9059',
                    latitude: 33.991341,
                    longitude: -6.799901,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 184,
                    device: 'ARER9055',
                    latitude: 33.991413,
                    longitude: -6.799935,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 161,
                    device: 'ARER9053',
                    latitude: 33.991447,
                    longitude: -6.799763,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 167,
                    device: 'ARER9042',
                    latitude: 33.991409,
                    longitude: -6.799836,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 166,
                    device: 'ARER9051',
                    latitude: 33.991421,
                    longitude: -6.799963,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 139,
                    device: 'ARER9050',
                    latitude: 33.99152,
                    longitude: -6.79992,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 149,
                    device: 'ARER9058',
                    latitude: 33.99131,
                    longitude: -6.79993,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 142,
                    device: 'ARER9043',
                    latitude: 33.991337,
                    longitude: -6.799924,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 158,
                    device: 'ARER9047',
                    latitude: 33.991482,
                    longitude: -6.799956,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 203,
                    device: 'ARER9049',
                    latitude: 33.991444,
                    longitude: -6.799903,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 219,
                    device: 'ARER9056',
                    latitude: 33.991348,
                    longitude: -6.799859,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 213,
                    device: 'ARER9046',
                    latitude: 33.991417,
                    longitude: -6.799828,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 212,
                    device: 'ARER9054',
                    latitude: 33.991444,
                    longitude: -6.799943,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 194,
                    device: 'ARER9057',
                    latitude: 33.991436,
                    longitude: -6.799933,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 176,
                    device: 'ARER9052',
                    latitude: 33.991421,
                    longitude: -6.79986,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 402,
                    device: 'TRIPORTEUR02',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 403,
                    device: 'HONDA ELECTRIQUE',
                    latitude: 33.991222,
                    longitude: -6.799698,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 25,
                    device: 'ARER8301',
                    latitude: 33.945518,
                    longitude: -6.86501,
                    vehicle_group_id: [60, 'Transfert'],
                },
                {
                    id: 100,
                    device: 'ARER1203',
                    latitude: 34.020363,
                    longitude: -6.771551,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 132,
                    device: 'RC72',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 387,
                    device: 'ARER6305OLD',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 81,
                    device: 'RC23',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 297,
                    device: 'ARER9339',
                    latitude: 33.991459,
                    longitude: -6.799861,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 294,
                    device: 'ARER9337',
                    latitude: 33.991314,
                    longitude: -6.799877,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 299,
                    device: 'ARER9341',
                    latitude: 33.99144,
                    longitude: -6.799855,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 298,
                    device: 'ARER9340',
                    latitude: 33.991432,
                    longitude: -6.799937,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 116,
                    device: 'ARER1202',
                    latitude: 34.016861,
                    longitude: -6.843015,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 388,
                    device: 'ARER6104OLD',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 275,
                    device: 'ARER9319',
                    latitude: 33.991467,
                    longitude: -6.799898,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 295,
                    device: 'ARER9338',
                    latitude: 33.99131,
                    longitude: -6.799922,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 296,
                    device: 'ARER9603',
                    latitude: 33.98914,
                    longitude: -6.848275,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 273,
                    device: 'ARER9317',
                    latitude: 33.991398,
                    longitude: -6.79983,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 343,
                    device: 'ARER9386',
                    latitude: 33.99139,
                    longitude: -6.799864,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 286,
                    device: 'ARER9329',
                    latitude: 33.991394,
                    longitude: -6.799925,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 193,
                    device: 'ARER9359',
                    latitude: 33.991386,
                    longitude: -6.79988,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 314,
                    device: 'ARER9358',
                    latitude: 33.991474,
                    longitude: -6.799882,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 136,
                    device: 'BAL001',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 200,
                    device: 'BAL016',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 189,
                    device: 'ARER9011',
                    latitude: 33.99144,
                    longitude: -6.799917,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 177,
                    device: 'ARER9003',
                    latitude: 33.991478,
                    longitude: -6.799892,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 202,
                    device: 'ARER9017',
                    latitude: 33.99136,
                    longitude: -6.799836,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 195,
                    device: 'ARER9020',
                    latitude: 33.991447,
                    longitude: -6.799953,
                    vehicle_group_id: [83, 'S1'],
                },
                {
                    id: 214,
                    device: 'ARER9044',
                    latitude: 33.99139,
                    longitude: -6.799828,
                    vehicle_group_id: [85, 'S3'],
                },
                {
                    id: 46,
                    device: 'ARER4105',
                    latitude: 33.992008,
                    longitude: -6.799652,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 24,
                    device: 'ARER8201',
                    latitude: 33.992004,
                    longitude: -6.799047,
                    vehicle_group_id: [60, 'Transfert'],
                },
                {
                    id: 281,
                    device: 'ARER9325',
                    latitude: 33.991459,
                    longitude: -6.799948,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 341,
                    device: 'ARER9600',
                    latitude: 33.987427,
                    longitude: -6.853034,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 182,
                    device: 'ARER9613',
                    latitude: 33.972111,
                    longitude: -6.872105,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 267,
                    device: 'ARER9311',
                    latitude: 33.991581,
                    longitude: -6.799977,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 272,
                    device: 'ARER9316',
                    latitude: 33.991211,
                    longitude: -6.799597,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 229,
                    device: 'ARER9398',
                    latitude: 33.991432,
                    longitude: -6.799859,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 169,
                    device: 'ARER9388',
                    latitude: 33.991383,
                    longitude: -6.799892,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 323,
                    device: 'ARER9367',
                    latitude: 33.991436,
                    longitude: -6.799942,
                    vehicle_group_id: [79, 'S3'],
                },
                {
                    id: 292,
                    device: 'ARER9335',
                    latitude: 33.99147,
                    longitude: -6.79993,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 258,
                    device: 'ARER9302',
                    latitude: 33.991405,
                    longitude: -6.799909,
                    vehicle_group_id: [77, 'S1'],
                },
                {
                    id: 223,
                    device: 'ARER9394',
                    latitude: 33.991501,
                    longitude: -6.799914,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 151,
                    device: 'ARER9085',
                    latitude: 33.991405,
                    longitude: -6.799873,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 362,
                    device: 'ARER9074',
                    latitude: 33.991386,
                    longitude: -6.799878,
                    vehicle_group_id: [86, 'S4'],
                },
                {
                    id: 127,
                    device: 'ARER1214',
                    latitude: 33.992088,
                    longitude: -6.867533,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 89,
                    device: 'ARER1229',
                    latitude: 34.055668,
                    longitude: -6.813807,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 253,
                    device: 'ARER1204',
                    latitude: 33.964149,
                    longitude: -6.88227,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 90,
                    device: 'ARER1222',
                    latitude: 33.803589,
                    longitude: -6.783501,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 254,
                    device: 'ARER1210',
                    latitude: 33.890381,
                    longitude: -6.939792,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 255,
                    device: 'ARER1225',
                    latitude: 33.932419,
                    longitude: -6.90087,
                    vehicle_group_id: [68, 'Moto de service'],
                },
                {
                    id: 123,
                    device: 'RC63',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 73,
                    device: 'RC15',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 110,
                    device: 'RC50',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 130,
                    device: 'ARER3501OLD1',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 51,
                    device: 'ARER4103',
                    latitude: 33.993008,
                    longitude: -6.839365,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 48,
                    device: 'ARER4107',
                    latitude: 33.988445,
                    longitude: -6.812825,
                    vehicle_group_id: [62, 'Benne Satellite'],
                },
                {
                    id: 131,
                    device: 'ARER4112',
                    latitude: 33.991886,
                    longitude: -6.799648,
                    vehicle_group_id: [71, 'Ampliroll'],
                },
                {
                    id: 371,
                    device: 'ARER3501OLD2',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 372,
                    device: 'ARER3501OLD3',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [57, 'TracCar'],
                },
                {
                    id: 129,
                    device: 'ARER3701-TracCar',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [73, 'Laveuse colonnes'],
                },
                {
                    id: 164,
                    device: 'ARER9344',
                    latitude: 33.991455,
                    longitude: -6.799832,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 160,
                    device: 'ARER9334',
                    latitude: 33.99147,
                    longitude: -6.799833,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 155,
                    device: 'ARER9320',
                    latitude: 33.99144,
                    longitude: -6.799864,
                    vehicle_group_id: [78, 'S2'],
                },
                {
                    id: 168,
                    device: 'ARER9408',
                    latitude: 33.991474,
                    longitude: -6.799973,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 170,
                    device: 'ARER9389',
                    latitude: 33.991474,
                    longitude: -6.799875,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 140,
                    device: 'ARER9080',
                    latitude: 33.991482,
                    longitude: -6.799838,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 143,
                    device: 'ARER9083',
                    latitude: 33.99139,
                    longitude: -6.79977,
                    vehicle_group_id: [87, 'S5'],
                },
                {
                    id: 159,
                    device: 'ARER9061OLD',
                    latitude: 0,
                    longitude: 0,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 141,
                    device: 'BAL006',
                    latitude: 33.991494,
                    longitude: -6.799556,
                    vehicle_group_id: [56, 'TrackBal'],
                },
                {
                    id: 183,
                    device: 'ARER9612',
                    latitude: 33.961628,
                    longitude: -6.874148,
                    vehicle_group_id: [88, 'AM AR'],
                },
                {
                    id: 231,
                    device: 'ARER9399',
                    latitude: 33.991409,
                    longitude: -6.799767,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 221,
                    device: 'ARER9392',
                    latitude: 33.991386,
                    longitude: -6.799752,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 234,
                    device: 'ARER9401',
                    latitude: 33.991451,
                    longitude: -6.799887,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 220,
                    device: 'ARER9391',
                    latitude: 33.991405,
                    longitude: -6.799878,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 222,
                    device: 'ARER9393',
                    latitude: 33.991467,
                    longitude: -6.799925,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 227,
                    device: 'ARER9397',
                    latitude: 33.991421,
                    longitude: -6.799878,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 235,
                    device: 'ARER9402',
                    latitude: 33.991444,
                    longitude: -6.799745,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 224,
                    device: 'ARER9395',
                    latitude: 33.99144,
                    longitude: -6.799812,
                    vehicle_group_id: [81, 'S5'],
                },
                {
                    id: 187,
                    device: 'ARER9354',
                    latitude: 33.991493,
                    longitude: -6.799838,
                    vehicle_group_id: [79, 'S3'],
                },
            ];

            const groups = [
                {
                    id: 1,
                    idd: '1',
                    groupid: '',
                    name: 'Stock',
                },
                {
                    id: 56,
                    idd: '2',
                    groupid: '1',
                    name: 'TrackBal',
                },
                {
                    id: 57,
                    idd: '3',
                    groupid: '1',
                    name: 'TracCar',
                },
                {
                    id: 58,
                    idd: '4',
                    groupid: '1',
                    name: 'TracBac',
                },
                {
                    id: 59,
                    idd: '5',
                    groupid: '',
                    name: 'Collecte',
                },
                {
                    id: 60,
                    idd: '6',
                    groupid: '5',
                    name: 'Transfert',
                },
                {
                    id: 61,
                    idd: '7',
                    groupid: '5',
                    name: 'Bom',
                },
                {
                    id: 62,
                    idd: '8',
                    groupid: '5',
                    name: 'Benne Satellite',
                },
                {
                    id: 63,
                    idd: '9',
                    groupid: '5',
                    name: 'Grue',
                },
                {
                    id: 64,
                    idd: '10',
                    groupid: '',
                    name: 'Lavage',
                },
                {
                    id: 65,
                    idd: '11',
                    groupid: '10',
                    name: 'Laveuse de bacs',
                },
                {
                    id: 66,
                    idd: '12',
                    groupid: '',
                    name: 'Véhicules de service',
                },
                {
                    id: 67,
                    idd: '14',
                    groupid: '12',
                    name: 'Moto',
                },
                {
                    id: 68,
                    idd: '13',
                    groupid: '14',
                    name: 'Moto de service',
                },
                {
                    id: 69,
                    idd: '16',
                    groupid: '12',
                    name: 'Voitures',
                },
                {
                    id: 70,
                    idd: '17',
                    groupid: '',
                    name: 'Balayage Mecanique',
                },
                {
                    id: 71,
                    idd: '18',
                    groupid: '5',
                    name: 'Ampliroll',
                },
                {
                    id: 72,
                    idd: '19',
                    groupid: '10',
                    name: 'Laveuse de voirie',
                },
                {
                    id: 73,
                    idd: '20',
                    groupid: '10',
                    name: 'Laveuse colonnes',
                },
                {
                    id: 74,
                    idd: '21',
                    groupid: '',
                    name: 'Balayage Manuel',
                },
                {
                    id: 75,
                    idd: '22',
                    groupid: '21',
                    name: 'EL YOUSSOUFIA SOUISSI',
                },
                {
                    id: 76,
                    idd: '23',
                    groupid: '21',
                    name: 'AGDAL RIAD',
                },
                {
                    id: 77,
                    idd: '24',
                    groupid: '22',
                    name: 'S1',
                },
                {
                    id: 78,
                    idd: '26',
                    groupid: '22',
                    name: 'S2',
                },
                {
                    id: 79,
                    idd: '27',
                    groupid: '22',
                    name: 'S3',
                },
                {
                    id: 80,
                    idd: '28',
                    groupid: '22',
                    name: 'S4',
                },
                {
                    id: 81,
                    idd: '29',
                    groupid: '22',
                    name: 'S5',
                },
                {
                    id: 82,
                    idd: '30',
                    groupid: '22',
                    name: 'AM SY',
                },
                {
                    id: 83,
                    idd: '31',
                    groupid: '23',
                    name: 'S1',
                },
                {
                    id: 84,
                    idd: '32',
                    groupid: '23',
                    name: 'S2',
                },
                {
                    id: 85,
                    idd: '33',
                    groupid: '23',
                    name: 'S3',
                },
                {
                    id: 86,
                    idd: '34',
                    groupid: '23',
                    name: 'S4',
                },
                {
                    id: 87,
                    idd: '35',
                    groupid: '23',
                    name: 'S5',
                },
                {
                    id: 88,
                    idd: '40',
                    groupid: '23',
                    name: 'AM AR',
                },
            ];

            const nestedData = this.createNestedData(vehicles, groups);

            $(this.jstreeRef.el)
                .jstree({
                    core: {
                        cache: false,
                        //   check_callback: true,
                        data: nestedData,
                        themes: {
                            responsive: true,
                        },
                    },
                    checkbox: {
                        //   cascade: 'up',
                        keep_selected_style: false,
                        three_state: false,
                        whole_node: false,
                        tie_selection: false,
                    },
                    plugins: [
                        'wholerow',
                        'contextmenu',
                        'dnd',
                        'search',
                        'state',
                        'types',
                        'wholerow',
                        'checkbox',
                    ],
                })
                .on('check_node.jstree uncheck_node.jstree', (e, data) => {
                    const selectedText = data.selected
                        .map((nodeId) => {
                            const node = data.instance.get_node(nodeId);
                            return node.text
                                .replace(/<[^>]+>/g, '')
                                .replace(/\s+/g, '');
                        })
                        .join(', ');

                    console.log('Selected: ' + selectedText);
                });

            $('#searchInputRef').on('input', (e) => {
                const searchString = e.target.value;
                $('#jstree').jstree('search', searchString);
            });
        } catch (error) {
            console.error('Error loading tree script:', error);
        }

        $('#searchInputRef').on('input', (e) => {
            const searchString = e.target.value;
            console.log(searchString);
            $('#jstree').jstree('search', searchString);
        });
    }

    createNestedData(vehicles, groups) {
        const topLevelGroups = groups.filter((group) => !group.groupid);

        const buildTree = (groupId) => {
            const children = groups
                .filter((group) => group.groupid === groupId)
                .map((group) => ({
                    id: group.id.toString(),
                    text: '<span class="semigroup_name1">' + group.name + ' </span>',
                    children: [
                        ...buildTree(group.idd),
                        ...buildVehicles(group.idd, group.id),
                    ],
                    type: 'group',
                    icon: 'none',
                }));

            return children;
        };

        const buildVehicles = (groupId, parentGroupId) => {
            const groupVehicles = vehicles
                .filter(
                    (vehicle) =>
                        (vehicle.vehicle_group_id[0] === groupId &&
                            vehicle.vehicle_group_id[0] === parentGroupId) ||
                        vehicle.vehicle_group_id[0] === parentGroupId
                )
                .map((vehicle) => ({
                    id: vehicle.id.toString(),
                    text: `
                  <div class="vehicle-node1">
                      <span class="vehicle-device">${vehicle.device}</span>
                      <div class="imgblock">
                          <img class="vehicle-icon" src="http://tanger.geodaki.com/cache/geodaki_exe/n7/res/__FDF7C185739802EB718FC7C5.png">
                          <img class="vehicle-icon" src="http://tanger.geodaki.com/cache/geodaki_exe/n7/res/__DF078BB014533351F35AB1A3.png">
                      </div>
                  </div>`,
                    type: 'vehicle',
                    icon: 'none',
                }));

            return groupVehicles;
        };

        const groupNodes = topLevelGroups.map((group) => ({
            id: group.id.toString(),
            text: '<span class="group_name">' + group.name + ' </span>',
            children: [...buildTree(group.idd), ...buildVehicles(group.idd, group.id)],
            type: 'group',
            icon: 'none',
        }));

        const nestedData = groupNodes;
        console.log(nestedData);

        return nestedData;
    }

    barClick(event) {
        const elements = getElementAtEvent(chartref.current, event);
        console.log('Event:', event);
        console.log('Elements:', elements);
        if (elements.length > 0) {
            console.log(elements);
        }
    }

    async Displaychart() {
        await this.loadScriptMounted();

        const ctx = document.getElementById('myChart');
        const ctx2 = document.getElementById('myChart2');

        var xData = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

        var yData = [23, 15, 13, 52, 23, 52, 73, 34, 75, 11, 64, 76];

        var config = {
            onClick: this.barClick.bind(this),
            type: 'bar',
            data: {
                labels: xData, // Date Objects
                datasets: [
                    {
                        label: 'dataset',
                        data: yData,
                        fill: false,
                    },
                ],
            },
            options: {
           

                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'Chart.js Time Scale',
                },
                scales: {
                    xAxes: [
                        {
                            type: 'time',
                            scaleLabel: {
                                display: false,
                                labelString: 'Date',
                            },
                            ticks: {
                                major: { enabled: true },
                                font: (context) => {
                                    console.log(context.tick);
                                },

                                maxRotation: 0,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            type: 'linear',
                            scaleLabel: {
                                display: true,
                                labelString: 'value',
                            },
                        },
                    ],
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            speed: 0.05,

                            drag: { enabled: true },
                            animation: {
                                duration: 0,
                            },
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true,
                            },
                            mode: 'x',
                        },
                    },
                },
            },
        };

        var configline = {
            onClick: this.barClick.bind(this),
            type: 'line',
            data: {
                labels: xData, // Date Objects
                datasets: [
                    {
                        label: 'dataset',
                        data: yData,
                        fill: false,
                    },
                ],
            },
            options: {
            

                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'Chart.js Time Scale',
                },
                scales: {
                    xAxes: [
                        {
                            type: 'time',
                            scaleLabel: {
                                display: false,
                                labelString: 'Date',
                            },
                            ticks: {
                                major: { enabled: true },
                                font: (context) => {
                                    console.log(context.tick);
                                },

                                maxRotation: 0,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            type: 'linear',
                            scaleLabel: {
                                display: true,
                                labelString: 'value',
                            },
                        },
                    ],
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            speed: 0.05,

                            drag: { enabled: true },
                            animation: {
                                duration: 0,
                            },
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true,
                            },
                            mode: 'x',
                        },
                    },
                },
            },
        };

        const chart = new window.Chart(ctx, config);
        const chart2 = new window.Chart(ctx2, configline);

        ctx.onclick = (evt) => {
            const res = chart.getElementsAtEventForMode(
                evt,
                'nearest',
                { intersect: true },
                true
            );

            if (res.length === 0) {
                return;
            }

            console.log(chart.data.labels[res[0].index]);
            console.log(chart.data.datasets[0].data[res[0].index]);
        };

        ctx2.onclick = (evt) => {
            const res = chart.getElementsAtEventForMode(
                evt,
                'nearest',
                { intersect: true },
                true
            );

            if (res.length === 0) {
                return;
            }

            console.log(chart.data.labels[res[0].index]);
            console.log(chart.data.datasets[0].data[res[0].index]);
        };
        this.chartInstances.push(chart, chart2);

        chart.canvas.parentNode.style.height = '100px';
        chart2.canvas.parentNode.style.height = '100px';
        chart.canvas.parentNode.style.width = 100;
    }

    ZoomIn2() {
        const chart = this.getChartInstance2('myChart');
        chart.zoom(1.1);
    }

    ZoomIn() {
        const chart11 = this.getChartInstance2('myChart');

        const ChartsIds = ['myChart', 'myChart2'];
        const charts = this.getChartInstances(ChartsIds);

        charts.forEach((chart) => {
            chart.zoom(1.1);
            chart.canvas.dispatchEvent(new MouseEvent('click')); // Simulate a click event on the canvas

            chart.update();
        });

        chart11.update();
    }

    ZoomOut() {
        const chart11 = this.getChartInstance2('myChart');

        const ChartsIds = ['myChart', 'myChart2'];
        const charts = this.getChartInstances(ChartsIds);

        charts.forEach((chart) => {
            chart.zoom(0.9);
            chart.canvas.dispatchEvent(new MouseEvent('click')); // Simulate a click event on the canvas

            chart.update();
        });

        chart11.update();
    }

    ResetZoom() {
        const chart11 = this.getChartInstance2('myChart');

        const ChartsIds = ['myChart', 'myChart2'];
        const charts = this.getChartInstances(ChartsIds);

        charts.forEach((chart) => {
            chart.resetZoom();

            chart.canvas.dispatchEvent(new MouseEvent('click')); // Simulate a click event on the canvas

            chart.update();
        });

        chart11.update();
    }

    getChartInstances(chartIds) {
        console.log(
            this.chartInstances.filter((chart) => chartIds.includes(chart.canvas.id))
        );
        return this.chartInstances.filter((chart) =>
            chartIds.includes(chart.canvas.id)
        );
    }

    getChartInstance2(chartId) {
        return this.chartInstances.find((chart) => chart.canvas.id === chartId);
    }
}

Diagnostic.template = 'owl.Diagnostic';
registry.category('actions').add('owl.action_Diagnostic_js', Diagnostic);
