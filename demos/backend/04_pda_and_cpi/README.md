# 🛹 Demo 4: PDA and CPI on Anchor

<br>

* In this demo, we adapted the code from [demo 2 (CPI and Anchor)](../02_anchor_cpi/) to add an example of PDA.

<br>


* The change happens mostly on `puppet-master`:

<br>

<p align="center">
<img src="https://github.com/urani-labs/solana-dev-onboarding-rs/assets/162904807/9acbfb26-4f46-4f48-9a69-19f68dbd9429" width="80%" align="center" style="padding:1px;border:1px solid black;"/>
</p>

<br>

* While on `puppet`, only one line is changed, to add `authority` to `PullStrings`:

<br>

<p align="center">
<img src="https://github.com/urani-labs/solana-dev-onboarding-rs/assets/162904807/9da015bf-348c-41b4-a5fc-6c1b2d9414e9" width="60%" align="center" style="padding:1px;border:1px solid black;"/>
</p>

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
