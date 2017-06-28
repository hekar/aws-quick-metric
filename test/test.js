'use strict';

const chai = require('chai');
const { assert } = chai;
chai.use(require('chai-as-promised'));

const sinon = require('sinon');
const { CustomMetric } = require('../');

describe('CustomMetric', function() {
  const namespace = 'MyCustomProject';
  const metric = 'MyCustomMetric';

  let sandbox, customMetric, cloudWatchMock;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    const aws = {
      CloudWatch: function() {
        const cloudWatch = {
          putMetricData: _ => _
        };
        cloudWatchMock = sandbox.mock(cloudWatch);
        return cloudWatch;
      }
    };

    customMetric = new CustomMetric(aws, namespace);
  });

  afterEach(function() {
    sandbox.verifyAndRestore();
  });

  describe('#stat(...)', function() {
    it('should call putMetricData with the correct arguments', function() {
      const value = 0.0;
      const unit = 'None';
      cloudWatchMock.expects('putMetricData')
        .withExactArgs({
          MetricData: [{
            MetricName: metric,
            Unit: unit,
            Value: value,
            Dimensions: []
          }],
          Namespace: this.namespace
        })
        .returns({
          promise: () => Promise.resolve()
        })
        .once();

      return customMetric.stat({
        metric,
        value,
        unit,
      });
    });

    it('should fail due to putMetricData error', function() {
      cloudWatchMock.expects('putMetricData')
        .returns({
          promise: () => Promise.reject(new Error(''))
        })
        .once();

      assert.isRejected(customMetric.stat({
        metric,
        value: 0.0,
        unit: 'None',
      }));
    });

    it('should throw due to missing value', function() {
      cloudWatchMock.expects('putMetricData')
        .never();

      assert.throws(() => customMetric.stat({
        metric
      }));
    });

    it('should throw due to missing metric', function() {
      cloudWatchMock.expects('putMetricData')
        .never();

      assert.throws(() => customMetric.stat({
        value: 0.0
      }));
    });
  });
});
