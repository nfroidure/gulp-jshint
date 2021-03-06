var jshint = require('../');
var should = require('should');
var gutil = require('gulp-util');
var path = require('path');
var Stream = require('stream');
var es = require('event-stream');
require('mocha');

describe('gulp-jshint', function() {
  describe('jshint() in buffer mode', function() {
    it('file should pass through', function(done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('wadup();')
      });

      var stream = jshint();
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        newFile.path.should.equal('./test/fixture/file.js');
        newFile.relative.should.equal('file.js');
        ++a;
      });

      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('should jshint two files', function(done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('wadup();')
      });

      var fakeFile2 = new gutil.File({
        path: './test/fixture/file2.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('wadup();')
      });

      var stream = jshint();
      stream.on('data', function(newFile){
        ++a;
      });

      stream.once('end', function () {
        a.should.equal(2);
        done();
      });

      stream.write(fakeFile);
      stream.write(fakeFile2);
      stream.end();
    });

    it('should send success status', function(done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('wadup();')
      });

      var stream = jshint();
      stream.on('data', function (newFile) {
        ++a;
        should.exist(newFile.jshint.success);
        newFile.jshint.success.should.equal(true);
        should.not.exist(newFile.jshint.results);
        should.not.exist(newFile.jshint.data);
        should.not.exist(newFile.jshint.opt);
      });
      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('should send failure status', function(done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('doe =')
      });

      var stream = jshint();
      stream.on('data', function (newFile) {
        ++a;
        should.exist(newFile.jshint.success);
        newFile.jshint.success.should.equal(false);
        should.exist(newFile.jshint.results);
        should.exist(newFile.jshint.data);
      });
      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('should load jshint file and fail', function(done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('wadup = 123;')
      });

      var stream = jshint(path.join(__dirname, './samplejshint'));
      stream.on('data', function (newFile) {
        ++a;
        should.exist(newFile.jshint.success);
        newFile.jshint.success.should.equal(false);
        should.exist(newFile.jshint.results);
        should.exist(newFile.jshint.data);
        should.exist(newFile.jshint.opt);
        newFile.jshint.results[0].error.reason.should.equal('\'wadup\' is not defined.');
      });
      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('should load jshint file and fail', function(done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('wadup = 123;')
      });

      var stream = jshint(path.join(__dirname, './samplejshint2'));
      stream.on('data', function (newFile) {
        ++a;
        should.exist(newFile.jshint.success);
        newFile.jshint.success.should.equal(true);
        should.not.exist(newFile.jshint.results);
        should.not.exist(newFile.jshint.data);
        should.not.exist(newFile.jshint.opt);
      });
      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

  });

  describe('jshint() in stream mode', function() {
    it('file should pass through', function(done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Stream.PassThrough()
      });
      fakeFile.contents.write(new Buffer('wadup();'));
      fakeFile.contents.end();

      var stream = jshint();
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        newFile.path.should.equal('./test/fixture/file.js');
        newFile.relative.should.equal('file.js');
        newFile.isStream().should.equal(true);
        ++a;
      });

      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('file should pass file contents through', function(done) {

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Stream.PassThrough()
      });
      fakeFile.contents.write(new Buffer('wadup();'));
      fakeFile.contents.end();

      var stream = jshint();
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        newFile.path.should.equal('./test/fixture/file.js');
        newFile.relative.should.equal('file.js');
        newFile.isStream().should.equal(true);
        newFile.contents.pipe(es.wait(function(err, data){
          data.should.equal('wadup();');
          done();
        }))
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('should jshint two files', function(done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Stream.PassThrough()
      });
      fakeFile.contents.write(new Buffer('wadup();'));
      fakeFile.contents.end();

      var fakeFile2 = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Stream.PassThrough()
      });
      fakeFile2.contents.write(new Buffer('wadup();'));
      fakeFile2.contents.end();

      var stream = jshint();
      stream.on('data', function(newFile){
        ++a;
      });

      stream.once('end', function () {
        a.should.equal(2);
        done();
      });

      stream.write(fakeFile);
      stream.write(fakeFile2);
      stream.end();
    });

    it('should send success status', function(done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Stream.PassThrough()
      });
      fakeFile.contents.write(new Buffer('wadup();'));
      fakeFile.contents.end();

      var stream = jshint();
      stream.on('data', function (newFile) {
        ++a;
        should.exist(newFile.jshint.success);
        newFile.jshint.success.should.equal(true);
        should.not.exist(newFile.jshint.results);
        should.not.exist(newFile.jshint.data);
        should.not.exist(newFile.jshint.opt);
      });
      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('should send failure status', function(done) {
      var a = 0;


      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Stream.PassThrough()
      });
      fakeFile.contents.write(new Buffer('doe='));
      fakeFile.contents.end();

      var stream = jshint();
      stream.on('data', function (newFile) {
        ++a;
        should.exist(newFile.jshint.success);
        newFile.jshint.success.should.equal(false);
        should.exist(newFile.jshint.results);
        should.exist(newFile.jshint.data);
      });
      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('should load jshint file and fail', function(done) {
      var a = 0;


      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Stream.PassThrough()
      });
      fakeFile.contents.write(new Buffer('wadup = 123;'));
      fakeFile.contents.end();

      var stream = jshint(path.join(__dirname, './samplejshint'));
      stream.on('data', function (newFile) {
        ++a;
        should.exist(newFile.jshint.success);
        newFile.jshint.success.should.equal(false);
        should.exist(newFile.jshint.results);
        should.exist(newFile.jshint.data);
        should.exist(newFile.jshint.opt);
        newFile.jshint.results[0].error.reason.should.equal('\'wadup\' is not defined.');
      });
      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('should load jshint file and fail', function(done) {
      var a = 0;


      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Stream.PassThrough()
      });
      fakeFile.contents.write(new Buffer('wadup =123;'));
      fakeFile.contents.end();

      var stream = jshint(path.join(__dirname, './samplejshint2'));
      stream.on('data', function (newFile) {
        ++a;
        should.exist(newFile.jshint.success);
        newFile.jshint.success.should.equal(true);
        should.not.exist(newFile.jshint.results);
        should.not.exist(newFile.jshint.data);
        should.not.exist(newFile.jshint.opt);
      });
      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

  });
});
