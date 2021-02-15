use wasm_bindgen::prelude::*;

// Mainly for testing, to make sure JS code can call a WASM function
extern crate web_sys;
#[wasm_bindgen]
pub fn log_message(msg: &JsValue) {
    web_sys::console::log_1(msg);
}


// FILTER FUNCTIONALITY
// extern crate serde_wasm_bindgen;
use serde::{Serialize, Deserialize};

// We hold image data in "unknitted" JS objects, with each color/alpha channel having its own Uint8clamped array
// #[wasm_bindgen]
// #[derive(Serialize, Deserialize, Debug)]
// pub struct FilterImageData<'a> {
//     r: Vec<&'a u8>,
//     g: Vec<&'a u8>,
//     b: Vec<&'a u8>,
//     a: Vec<&'a u8>,
// }

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Debug)]
pub struct FilterAverageChannels {
    pub length: u64,
    pub include_red: bool,
    pub input: str,
}

impl FilterAverageChannels {

    // pub fn make (packet: JsValue) -> FilterAverageChannels {

    //     let input = HashMap::new();

    //     if packet.input.is_truthy() {
    //         input.insert(String::from("r"), packet.input.r);
    //         input.insert(String::from("g"), packet.input.g);
    //         input.insert(String::from("b"), packet.input.b);
    //         input.insert(String::from("a"), packet.input.a);
    //     }

    //     FilterAverageChannels {
    //         length: packet.length,
    //         include_red: packet.include_red,
    //         input,
    //     }
    // }
}

#[wasm_bindgen]
pub fn average_channels (packet: FilterAverageChannels) -> JsValue {

    // let j_packet = FilterAverageChannels::make(&packet) { 

    // };

    let msg = format!("average_channels called - length is {}, include_red is {}", &packet.length, &packet.include_red);
    let j_msg = JsValue::from(&msg[..]);

    // web_sys::console::log_1(&j_msg);

    // let data: FilterAverageChannels = serde_json::from_str(&packet).unwrap();

    // let FilterAverageChannels { len, include_red, input } = data;

    // let result = serde_json::to_string(&input).unwrap();

    // result
    j_msg
}

// #[wasm_bindgen]
// pub fn average_channels(length: u32, input: FilterImageData, output: FilterImageData, include_red: bool, include_green: bool, include_blue: bool, exclude_red: bool, exclude_green: bool, exclude_blue: bool) -> FilterImageData {

// pub fn average_channels(
//     length: u32, 
//     input: JsValue,
//     output: JsValue,
//     include_red: bool, 
//     include_green: bool, 
//     include_blue: bool, 
//     exclude_red: bool, 
//     exclude_green: bool, 
//     exclude_blue: bool
//     ) -> JsValue {

//     // let rust_input: FilterImageData = serde_wasm_bindgen::from_value(input);
//     // let rust_output: FilterImageData = serde_wasm_bindgen::from_value(output);

//     let FilterImageData {r: in_r, g: in_g, b: in_b, a: in_a} = rust_input;

//     let FilterImageData {r: mut out_r, g: mut out_g, b: mut out_b, a: mut out_a} = rust_output;

//     let mut divisor = 0;
//     if include_red {divisor += 1};
//     if include_green {divisor += 1};
//     if include_blue {divisor += 1};

//     for i in 0..length {

//         let n = i as usize;

//         let red = in_r[n];
//         let grn = in_g[n];
//         let blu = in_b[n];
//         let alp = in_a[n];

//         if alp > 0 {

//             if divisor > 0 {

//                 let mut avg = 0;

//                 if !exclude_red { avg += red; }
//                 if !exclude_green { avg += grn; }
//                 if !exclude_blue { avg += blu; }

//                 avg /= divisor;

//                 if !exclude_red { out_r[n] = avg; }
//                 if !exclude_green { out_g[n] = avg; }
//                 if !exclude_blue { out_b[n] = avg; }
//                 out_a[n] = alp;
//             }
//             else {

//                 if !exclude_red { out_r[n] = red; }
//                 if !exclude_green { out_g[n] = grn; }
//                 if !exclude_blue { out_b[n] = blu; }
//                 out_a[n] = alp;
//             }
//         }
//         else {
//             out_r[n] = red;
//             out_g[n] = grn;
//             out_b[n] = blu;
//             out_a[n] = alp;
//         }
//     }

//     let res = FilterImageData{
//         r: out_r,
//         g: out_g,
//         b: out_b,
//         a: out_a,
//     };
//     serde_wasm_bindgen::to_value(&res)
// }
