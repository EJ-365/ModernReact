/* Encapsulation a key concept in OOP that helps protect data and keep our code well-organized.
 it means we keep some data private inside a class so that it cannot be changed directly
  from outside the class. Instead we use method and function to control access to that data.

but why use it?
1. basically it protect important data. (prevent direct changes to important values)
2. Makes code cleaner (organizes data and method inside the class)
3. Improves security (Ensures that only specific data can modify or access data)

Example a BankAccount class that has a private property called #balance 
that's only accessible inside the class and methods, the hash symbol means it's private 
and the balance cannot be change directly cause it's private property  
*/

class BankAccount{
  #balance; // private property
  constructor(owner, balance){
    this.owner = owner;
    this.#balance = balance;
  }
  deposit(amount){
    if(amount > 0) {
      this.#balance += amount;
      console.log(`Deposited: ${amount}`)
    }
    
    else {
     return`Deposit amount must be positive`;
    }
  }
  
  getBalance(){
    return   `Current Balance: ${this.#balance}`
  }
}
const account = new BankAccount('John Doe', 250)

 account.deposit(500)
 console.log(account.getBalance())

  