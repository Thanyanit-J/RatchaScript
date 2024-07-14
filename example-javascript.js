// Variables and Constants
let age = 25;
const name = "John Doe";
var country = "United States";

// Function Declaration
function greet(person) {
    console.log("Hello, " + person + " from " + country + "!");
}

// Arrow Function
const add = (a, b) => a + b;

// Class and Object
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    // Method
    describe() {
        return this.name + " is " + this.age + " years old.";
    }
}

// Conditional Statement
if (age > 18) {
    console.log("Adult");
} else {
    console.log("Minor");
}

// Loop
for (let i = 0; i < 5; i++) {
    console.log("Iteration " + i);
}

while(true) {
    break;
}

// Try-Catch
try {
    greet(name);
    let sum = add(5, 10);
    console.log("Sum: " + sum);
    
    let person = new Person(name, age);
    console.log(person.describe());
    console.log("Person's Name: " + person.name + ", Age: " + person.age);
} catch (error) {
    console.error("Error: " + error.message);
}

// Array and forEach
const numbers = [1, 2, 3, 4, 5];
numbers.forEach(num => {
    console.log("Number: " + num);
});

// Object Destructuring
const user = {
    username: "johndoe",
    email: "johndoe@example.com"
};

const { username, email } = user;
console.log("Username: " + username + ", Email: " + email);

// Spread Operator
const newUser = { ...user, age: 30 };
console.log(newUser);

// Promises and Async/Await
const fetchData = async () => {
    try {
        let response = await fetch('https://api.example.com/data');
        let data = await response.json();
        console.log("Async/Await Data: " + data);
    } catch (error) {
        console.error("Failed to fetch data with async/await", error);
    }
};

fetchData();

const fetchDataWithThen = () => {
    fetch('https://api.example.com/data')
        .then(response => response.json())
        .then(data => {
            console.log("Promise .then Data: " + data);
        })
        .catch(error => {
            console.error("Failed to fetch data with .then", error);
        });
};

fetchDataWithThen();
