# Node template

Template for nodejs based projects.

- Editorconfig
- ESlint
- nyc

```
npm install --save-dev nyc mocha lodash sinon chai cross-env coveralls supertest nock editorconfig eslint
```


```
"lint": "eslint *.js src test",

"test": "cross-env NODE_ENV=test NODE_PATH=$NODE_PATH$:./src STACK_NAME=test nyc --all mocha --recursive ./test && npm run lint",
"test-debug": "cross-env NODE_PATH=$NODE_PATH$:./src STACK_NAME=test mocha debug --recursive ./test",
"test-nocov": "cross-env NODE_PATH=$NODE_PATH$:./src STACK_NAME=test mocha --recursive ./test",
"test-html": "cross-env NODE_PATH=$NODE_PATH$:./src STACK_NAME=test nyc --all --reporter=html mocha --recursive ./test && nyc report",

"coverage": "nyc report --reporter=lcov",
"coveralls-coverage": "nyc report --reporter=text-lcov | coveralls",
```