
# [commercetools-utils](https://github.com/mmularski/commercetools-utils)

CLI Tool for some Commercetools useful actions like:
- Personal data erasure
- Personal data anonymization
- Generating some mock data

**Table of contents:**

- [Quickstart](#quickstart)
- [Configuration](#configuration)
- [Anonymization](#anonymization)
- [Personal data erasure](#personal-data-erasure)
- [Filling mock data](#filling-mock-data)
- [Feature todo plans](#feature-todo-plans)

---

## Quickstart

1. Clone the repository
2. Type `yarn start`
3. The CLI will ask you for all necessary stuff needed to achieve filling data/anonymization or erasure

All needed configuration is stored in the `config.json` file.

`config.json`

```json
{
  "batchSize": 100,
  "commercetools": {
    "authUri": "...",
    "baseUri": "...",
    "clientId": "...",
    "clientSecret": "...",
    "projectKey": "...",
    "scopes": ["..."]
  }
}
```

**Note**
The first run of the script will ask you for all the necessary stuff and will save it under that file. Each next run will be able to reuse the previous configuration or use a new ones

---

### Anonymization

The mechanism allows anonymizing personal data(using "Generalization" and "Data Masking" techniques) for one or all customers in a commercetools environment(except custom fields)

#### Example

```
➜  commercetools-utils git:(main) ✗ yarn start
yarn run v1.22.19

$ yarn install && yarn build
[1/4] 🔍  Resolving packages...
success Already up-to-date.
$ rimraf dist
$ tsc
$ node dist/index.js

? What do you want to do? anonymize
? Do you want to use stored values in the config file? Yes
? What do you want to anonymize? Choose per each entity separately

? Do you want to anonymize REVIEW entities? Yes
? How many REVIEW entities do you want to anonymize All


? Do you want to anonymize SHOPPINGLIST entities? Yes
? How many SHOPPINGLIST entities do you want to anonymize All


? Do you want to anonymize ORDER entities? Yes
? How many ORDER entities do you want to anonymize All


? Do you want to anonymize CART entities? Yes
? How many CART entities do you want to anonymize All


? Do you want to anonymize CUSTOMER entities? Yes
? How many CUSTOMER entities do you want to anonymize All


? If program will find any carts with the "Ordered" status(that cannot be modified, but can be deleted without a loss of order itself),
        Do you want to delete such carts? Yes



┌ Anonymizer INFO ───────────────────┐
│                                    │
│   Processing entity: review        │
│                                    │
│         This may take a while...   │
│                                    │
└────────────────────────────────────┘
[1 / 3] Entity with ID [fd521f79-8a17-4571-b47e-c7f0d00faac1] has been successfully anonymized.
[2 / 3] Entity with ID [9d13efd0-0aa7-4777-b396-5029932aae8d] has been successfully anonymized.
[3 / 3] Entity with ID [e5d633b9-9214-427c-9434-ba57b401a43c] has been successfully anonymized.



┌ Anonymizer INFO ─────────────────────┐
│                                      │
│   Processing entity: shoppingList    │
│                                      │
│         This may take a while...     │
│                                      │
└──────────────────────────────────────┘
[1 / 3] Entity with ID [4e9a1cba-1a4b-4ec6-85d6-98bf1b37a6c9] has been successfully anonymized.
[2 / 3] Entity with ID [36577f7f-7c0c-4d26-bfaa-e61917270208] has been successfully anonymized.
[3 / 3] Entity with ID [38d1d1a7-46da-4a1c-b088-9ef082153f14] has been successfully anonymized.



┌ Anonymizer INFO ───────────────────┐
│                                    │
│   Processing entity: order         │
│                                    │
│         This may take a while...   │
│                                    │
└────────────────────────────────────┘
[1 / 1] Entity with ID [2245a6df-543a-1s3e-bbc0-31eop0c84b7c] has been successfully anonymized.


┌ Anonymizer INFO ───────────────────┐
│                                    │
│   Processing entity: cart          │
│                                    │
│         This may take a while...   │
│                                    │
└────────────────────────────────────┘
[1 / 1] Entity with ID [62c336df-313a-4d3e-bbc0-31e54be7bb7c] has been successfully anonymized.



┌ Anonymizer INFO ───────────────────┐
│                                    │
│   Processing entity: customer      │
│                                    │
│         This may take a while...   │
│                                    │
└────────────────────────────────────┘
[1 / 1] Entity with ID [f7f664b6-83be-424b-b6ed-5a567f1c81ca] has been successfully anonymized.


Done
✨  Done in 26.14s.
```

---

### Personal data erasure

The mechanism allows erasing all personal data(reviews, shopping lists, payments and transactions, orders, carts, customer) for one or all customers in the a commercetools environment

#### Example

```
➜  commercetools-utils git:(main) ✗ yarn start
yarn run v1.22.19
$ yarn install && yarn build
[1/4] 🔍  Resolving packages...
success Already up-to-date.
$ rimraf dist
$ tsc
$ node dist/index.js
? What do you want to do? erase
? Do you want to use stored values in the config file? Yes
? How many customers do you want to erase? All(with guests)
[1 / 1] Customer with ID[f7f664b6-83be-424b-b6ed-5a567f1c81ca] has been successfully removed with all dependant data.

┌ INFO ─────────────────────────────────────────────────────┐
│                                                           │
│   Starting guests destruction. This may take a while...   │
│                                                           │
└───────────────────────────────────────────────────────────┘
.....

Done
✨  Done in 8.27s.
```

---

### Filling mock data

The script is also able to fill your commercetools environment with mocked data like

- customers
- carts
- orders
- payments and transactions
- reviews
- shopping lists

with random number of objects for each entity

#### Example

```
➜  commercetools-utils git:(develop) ✗ yarn start
yarn run v1.22.19

$ yarn install && yarn build
[1/4] 🔍  Resolving packages...
success Already up-to-date.
$ rimraf dist
$ tsc
$ node dist/index.js
? What do you want to do? fill
? Do you want to use stored values in the config file? Yes
? How many customers you would like to create? 1

[1 / 1] Created customer with ID[000f48d9-c566-4b7b-85ff-67f1221272f2]
      3 fake cart objects for the customer.
      4 fake payment objects for the customer.
      5 fake order objects for the customer.
      5 fake guest order objects.
      0 fake review objects for the customer.
      2 fake shopping lists objects for the customer.



Done

Elapsed time: 1 seconds.
✨  Done in 7.86s.
```

---
### Feature todo plans

- Different anonymization techniques
- A mechanism with configuration of custom fields anonymization
- non-interactive mode for CI/CD purposes
