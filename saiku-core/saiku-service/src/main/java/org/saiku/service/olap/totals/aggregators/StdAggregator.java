package org.saiku.service.olap.totals.aggregators;

import mondrian.util.Format;
import org.olap4j.metadata.Measure;

public class StdAggregator extends TotalAggregator {
    protected StdAggregator( Format format ) {
        super( format );
    }

    double accumulator = 0.0;
    double accumulatorSquare = 0.0;
    long count = 0;

    @Override
    public void addData( double data ) {
        this.count++;
        accumulator += data;
        accumulatorSquare += data*data;
    }


    @Override
    public Double getValue() {
        if ( count > 0 ) {
            return Math.sqrt(accumulatorSquare/count - (accumulator/count)*(accumulator/count));
        }
        return null;
    }

    @Override
    public TotalAggregator newInstance( Format format, Measure measure ) {
        return new StdAggregator( format );
    }
}
