package org.saiku.plugin;

import com.google.gson.Gson;
import org.apache.commons.io.IOUtils;
import org.json.JSONObject;
import org.pentaho.platform.api.action.IStreamProcessingAction;
import org.pentaho.platform.api.action.IStreamingAction;
import org.pentaho.platform.api.action.IVarArgsAction;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.olap.util.formatter.CellSetFormatterFactory;
import org.saiku.olap.util.formatter.ICellSetFormatter;
import org.saiku.plugin.resources.ExtendedJAXRSPluginServlet;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.ThinQueryService;
import org.saiku.web.export.PdfReport;
import org.saiku.web.rest.objects.resultset.QueryResult;
import org.saiku.web.rest.util.RestUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;


public class SimplePdfAction implements IVarArgsAction,IStreamProcessingAction,IStreamingAction {

    private static final Logger log = LoggerFactory.getLogger(SimplePdfAction.class);

    private InputStream inputStream;
    private OutputStream outputStream;
    private Map<String, Object> inputParams = new HashMap<String, Object>();


    public void setInputStream(InputStream inputStream) {
        this.inputStream = inputStream;
    }

    public String getMimeType(String s) {
        return "application/pdf";
    }

    public void setOutputStream(OutputStream outputStream) {
        this.outputStream = outputStream;
    }

    public void setVarArgs(Map<String, Object> map) {
        inputParams.clear();
        inputParams.putAll( map );
    }

    public void execute() {
        try {
            String json = IOUtils.toString(inputStream);


            Gson gson = new Gson();
            ThinQuery tq = gson.fromJson(json,ThinQuery.class);


            IPluginManager pluginManager = PentahoSystem.get( IPluginManager.class );
            ThinQueryService service = (ThinQueryService) pluginManager.getBean("thinQueryBean");


            CellDataSet cellData = service.execute(tq);

            QueryResult queryResult = RestUtil.convert(cellData);
            PdfReport pdf = new PdfReport();
            byte[] doc  = pdf.createPdf(queryResult, null);
            IOUtils.write(doc,outputStream);
            outputStream.flush();
            outputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }



    }
}
