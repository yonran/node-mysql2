var common     = require('../../common');
var connection = common.createConnection({ bigNumberString: true });
var assert     = require('assert');
var bn         = require('bn.js');

var table = 'insert_test';
connection.query([
  'CREATE TEMPORARY TABLE `bigs` (',
  '`id` bigint NOT NULL AUTO_INCREMENT,',
  '`title` varchar(255),',
  'PRIMARY KEY (`id`)',
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8'
].join('\n'));

var result, result2;
connection.query("INSERT INTO bigs SET title='test', id=123");
connection.query("INSERT INTO bigs SET title='test1'", function(err, result) {
  if (err) throw err;
  assert.strictEqual(result.insertId, 124);
  // > 24 bits
  connection.query("INSERT INTO bigs SET title='test', id=123456789");
  connection.query("INSERT INTO bigs SET title='test2'", function(err, result) {
    assert.strictEqual(result.insertId, 123456790);
    // big int
    connection.query("INSERT INTO bigs SET title='test', id=9007199254740992");
    connection.query("INSERT INTO bigs SET title='test3'", function(err, result) {
      assert.strictEqual((new bn("9007199254740993")).cmp(result.insertId), 0);
      connection.query("INSERT INTO bigs SET title='test', id=90071992547409924");
      connection.config.bigNumberStrings = true;
      connection.query("INSERT INTO bigs SET title='test4'", function(err, result) {
        assert.strictEqual(result.insertId, "90071992547409925");
        connection.end();
      });
    });
  });
});