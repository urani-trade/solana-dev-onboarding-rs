# 🛹 Writing Secure Programs on Solana 

<br>

#### 👉🏼 [Solana security overview](#common-security-exploits)

#### 👉🏼 [Security security resources](#security-security-resources)



<br>

-----

## Common Security Exploits

<br>


#### Missing Address Check

* Make sure that an account has the expected address (pubkey).
* For example, verifying that an `admin` account is associated with the config account using the constraint `has_one = admin`.

<br>

#### Missing Ownership Check

* Verify that an account is owned by the expected program by using Anchor's `Account<`info, T>` type that checks the owner (instead of `AccountInfo<`info>`).

<br>

#### Missing Signer Check

* This vulnerability occurs when an account is not signed so anyone who knows the user pubkey can use it in a transaction.
* A solution is to replace `AccountInfo<'info>` with `Signer<'info>`.

<br>

#### Exploiting Arbitrary CPI

* Verify that the target program to be invoked has the correct address.
* For example, if the main program invokes an external program to transfer funds from a user account to a pool account and the program does not verify the address of the external program, an arbitrary code execution can happen.
* To mitigate, replace the `AccountInfo<'info>` type (which is unverified) with Anchor's `Program<'info, T>` type.
* Note that Anchor supports `System`, `Token`, and `AssociatedToken` programs, but other programs must have the CPI modules generated.
* To learn more, check out [soldev.app's lesson on Arbitrary CPI](https://www.soldev.app/course/arbitrary-cpi).

<br>

#### Math & Logic Issues

* Beware of arithmetics and precision issues.
* Validate account data and instruction parameters.
* Make sure instructions are executed in the correct order.
* Make sure to prevent unintended behavior when passing duplicated accounts.
 
<br>

#### Reinitialization and Revival Attacks

* Make sure not to re-initialize an already-initialized account.
* Make sure to refrain from re-using an already closed account.
* To learn more, check out [soldev.app's lesson on Reinitialization Attacks](https://www.soldev.app/course/reinitialization-attacks).


<br>

#### PDAs

* Use canonical bump to avoid multiple valid PDAs (never let the user define an arbitrary bump).
* Do not share global PDA authorities; instead, use account-specific PDAs.
* To learn more, check out [soldev.app's lesson on Bump Seed Canonicalization](https://www.soldev.app/course/bump-seed-canonicalization).

<br>

---

## Security security resources

<br>

* [Neodyme's Secure Scaffold](https://github.com/neodyme-labs/tradeoffer-secure-coding-workshop.git)
* [Ackee's Trdelník for Fuzzing](https://github.com/Ackee-Blockchain/trident)
* [Ackee's Writing Secure Solana Programs](https://www.youtube.com/watch?v=Qkf9QwSfHAM)
* [Fuzz Testing Solana Programs with Trident](https://www.youtube.com/watch?v=5Lq8iEbMFbs)
* [Solana Anchor Program Fuzzing with Trident I](https://www.youtube.com/watch?v=5JRVnxGW8kc) and [II]()
