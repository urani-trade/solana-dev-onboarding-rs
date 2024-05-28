# 🛹 Demo 5: Ackee's X Example 
### (Mia's quick solution)

<br>


A classical exercise for folks to learn PDAs in practice is Ackee's X App example: a program that can perform basic functions like:

- **creating tweets**, including a topic of up to `32 bytes` and content of up to `500 bytes`. The topic is the seed for this PDA (so users can have more than one tweet).
- **adding/removing tweet reactions**, covered by a new reaction account and PDA. In this case, the seeds for this PDA are chosen to prevent more than one reaction per user on a tweet.
- **adding/removing tweet comments**, including a content field (`500 bytes`) that stores the text and is used as input into the comment account PDA.


<br>

----

### Running the Demo

<br>

* Build with both libraries, puppet and puppet-master, with:

```
anchor build
```

<br>

* And then run tests on puppet with:

```
anchor test
```


