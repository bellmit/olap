package org.saiku.service.olap.totals.aggregators;

import mondrian.util.Format;
import org.olap4j.Cell;
import org.olap4j.OlapException;
import org.olap4j.metadata.Datatype;
import org.olap4j.metadata.Measure;
import org.olap4j.metadata.Property;

import java.util.Set;

public class AvgAggregator extends TotalAggregator {
  private static final Property DRILLTHROUGH_COUNT = new Property() {

    public String getCaption() {
      return null;
    }

    public String getDescription() {
      return null;
    }

    public String getName() {
      return "DRILLTHROUGH_COUNT";
    }

    public String getUniqueName() {
      return null;
    }

    public boolean isVisible() {
      return false;
    }

    public ContentType getContentType() {
      return null;
    }

    public Datatype getDatatype() {
      return null;
    }

    public Set<TypeFlag> getType() {
      return null;
    }

  };

  protected AvgAggregator( Format format ) {
    super( format );
  }

  double accumulator = 0.0;
  long count = 0;

  @Override
  public void addData( double data ) {
    this.count++;
    accumulator += data;
  }


  @Override
  public Double getValue() {
    if ( count > 0 ) {
      return accumulator / count;
    }
    return null;
  }

  @Override
  public TotalAggregator newInstance( Format format, Measure measure ) {
    return new AvgAggregator( format );
  }

}