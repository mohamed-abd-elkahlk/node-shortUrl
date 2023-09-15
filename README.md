# Shot URL

Ok this an _**MERN Stack app**_ that will take from the user a long `url` and make it short for the user

## steps to create the app

1. Create a database to store the short URLs and their corresponding long URLs.

1. Create a REST API to allow users to create, delete, and view short URLs.

1. Create a frontend that allows users to enter long URLs and get back short URLs.
    - the frontend is to test your `api`
    if you have somting like ***postman*** it will be ok.  

1. Implement a way to generate unique short URLs.

1. Implement a way to prevent users from creating duplicate short URLs.

## some futrues and how i will add them

one feature that could be challenging to implement in a short URL app is the ability to generate unique short URLs. This is because there are a limited number of possible short URLs, and as more and more short URLs are created, it becomes more difficult to generate unique ones.

There are a few different ways to generate unique short URLs. One way is to use a random number generator to generate a string of characters, and then check if that string is already in use. If it is, the generator will generate another string of characters. This process can be repeated until a unique short URL is generated.

Another way to generate unique short URLs is to use a hash function. A hash function is a mathematical function that takes an input of any length and outputs a string of characters of a fixed length. This means that if you hash the same long URL twice, you will always get the same short URL.

The challenge with using a hash function is that it is possible for two different long URLs to hash to the same short URL. This is called a hash collision. To prevent hash collisions, you can use a salt. A salt is a random string of characters that is added to the long URL before it is hashed. This makes it much less likely that two different long URLs will hash to the same short URL.

No matter which method you use to generate unique short URLs, it is important to make sure that your algorithm is efficient. This means that it should be able to generate unique short URLs quickly and easily.

Another challenging feature to implement in a short URL app is the ability to prevent users from creating duplicate short URLs. This can be done by storing the short URLs in a database and checking if the short URL already exists before creating it. However, this can be slow if you have a lot of short URLs in your database.

A more efficient way to prevent duplicate short URLs is to use a Bloom filter. A Bloom filter is a probabilistic data structure that can be used to test whether an element is a member of a set. It is very efficient, but it is not 100% accurate. This means that there is a small chance that a short URL that does not exist will be flagged as a duplicate.

The best way to prevent duplicate short URLs will depend on the size of your database and the amount of traffic your app is expected to receive.