/* MonoMuse Tea Museum — script.js (Increment 3)
   New in this increment: dynamic footer year, time-based greeting
 */

/* Variable practice from console exercises */
var x = 5;
var y = 7;
var z = x + y;
console.log(z);   // 12

var A = "Hello ";
var B = "world!";
var C = A + B;
console.log(C);   // Hello world!

/* Basic function to sum and print */
function sumnPrint(x1, x2) {
    var result = x1 + x2;
    console.log(result);
}

sumnPrint(x, y);
sumnPrint(A, B);

/* Conditional logic to compare lengths */
if (C.length > z) {
    console.log(C);
} else if (C.length < z) {
    console.log(z);
} else {
    console.log("good job!");
}

/* Arrays and loops to search for items */
var L1 = ["Watermelon", "Pineapple", "Pear", "Banana"];
var L2 = ["Apple", "Banana", "Kiwi", "Orange"];

// Commented out after verification
// function findTheBanana(arr) {
//     for (var i = 0; i < arr.length; i++) {
//         if (arr[i] === "Banana") {
//             alert("Found Banana in array!");
//         }
//     }
// }
//
// findTheBanana(L1);
// findTheBanana(L2);

/* Footer year — updates dynamically on all pages */
function addYear() {
    var el = document.getElementById('copyYear');
    if (el) {
        el.textContent = '\u00A9 ' + new Date().getFullYear() + ' MonoMuse. All rights reserved.';
    }
}

/* Time-based greeting that appears on the home page */
var now  = new Date();
var hour = now.getHours();

function greeting(h) {
    var el = document.getElementById('greeting');
    if (!el) return;   // guard: element only exists on index.html

    var msg;
    if (h < 5 || h >= 20) {
        msg = 'Good evening \u2014 welcome to MonoMuse Tea Museum.';
    } else if (h < 12) {
        msg = 'Good morning \u2014 welcome to MonoMuse Tea Museum.';
    } else if (h < 18) {
        msg = 'Good afternoon \u2014 welcome to MonoMuse Tea Museum.';
    } else {
        msg = 'Good evening \u2014 welcome to MonoMuse Tea Museum.';
    }
    el.textContent = msg;
}

addYear();
greeting(hour);
