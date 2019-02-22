package org.saiku.service.olap.totals.aggregators;

import mondrian.util.Format;
import org.olap4j.metadata.Measure;

import java.util.Comparator;
import java.util.PriorityQueue;

public class MedianAggregator extends TotalAggregator{
    protected MedianAggregator( Format format ) {
        super( format );
    }

    PriorityQueue<Double> minHeap = new PriorityQueue<>();
    PriorityQueue<Double> maxHeap = new PriorityQueue<>(15, new Comparator<Double>() {
        @Override
        public int compare(Double o1, Double o2) {
            if (o2 - o1 > 0) {
                return 1;
            } else if (o2 - o1 == 0) {
                return 0;
            } else {
                return -1;
            }
        }
    });
    long count = 0;


    @Override
    public void addData( double data ) {
        if (count %2 == 0) {
            maxHeap.offer(data);
            Double filteredMaxNum = maxHeap.poll();
            minHeap.offer(filteredMaxNum);
        } else {
            minHeap.offer(data);
            Double filteredMinNum = minHeap.poll();
            maxHeap.offer(filteredMinNum);
        }
        count++;
    }

    @Override
    public Double getValue() {
        if (count > 0) {
            if (count %2 == 0) {
                return (minHeap.peek() + maxHeap.peek()) / 2;
            } else {
                return minHeap.peek();
            }
        }
        return null;
    }

    @Override
    public TotalAggregator newInstance( Format format, Measure measure ) {
        return new MedianAggregator( format );
    }
}
