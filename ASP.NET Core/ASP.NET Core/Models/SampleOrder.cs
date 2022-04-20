using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ASP_NET_Core.Models {
    public class SampleOrder {
        public int OrderID { get; set; }
        public string ShipAddress { get; set; }
        public string ShipCity { get; set; }
        public string ShipName { get; set; }
    }
}
