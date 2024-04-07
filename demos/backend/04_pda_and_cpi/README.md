# 🛹 Demo 4: PDA and CPI on Anchor

<br>

* In this demo, we adapted the code from [demo 2 (CPI and Anchor)](../02_anchor_cpi/) to add an example of PDA.

<br>


* The change happens mostly on `puppet-master`:

<br>


<br>

* While, on `puppet`, only one line is changed, to add `authority` to `PullStrings`:

<br>


<br>


---

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

<br>

---

### References

<br>

* [Cross-program instructions and PDA, by Anchor](https://www.anchor-lang.com/docs/cross-program-invocations)