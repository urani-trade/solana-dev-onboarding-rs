export type 07CreateDappCli = {
  "version": "0.1.0",
  "name": "07_create_dapp_cli",
  "instructions": [
    {
      "name": "close",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "07CreateDappCli",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "decrement",
      "accounts": [
        {
          "name": "07CreateDappCli",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "increment",
      "accounts": [
        {
          "name": "07CreateDappCli",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "07CreateDappCli",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "set",
      "accounts": [
        {
          "name": "07CreateDappCli",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "value",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "07CreateDappCli",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

export const IDL: 07CreateDappCli = {
  "version": "0.1.0",
  "name": "07_create_dapp_cli",
  "instructions": [
    {
      "name": "close",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "07CreateDappCli",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "decrement",
      "accounts": [
        {
          "name": "07CreateDappCli",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "increment",
      "accounts": [
        {
          "name": "07CreateDappCli",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "07CreateDappCli",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "set",
      "accounts": [
        {
          "name": "07CreateDappCli",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "value",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "07CreateDappCli",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
