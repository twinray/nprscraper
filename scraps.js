// notes on how static works

class Person {
    static bar () {
        return 'bar';
    }

    constructor (name) {
        this.name = name;
    }

    greet () {
        return `Hello ${this.name}`;
    }
}

console.log(Person.bar());

let joe = new Person('joe');
console.log(joe.greet());
