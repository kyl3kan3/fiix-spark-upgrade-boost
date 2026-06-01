import MaterialIcon from '@/components/ui/material-icon';

const Features = () => {
  return (
    <section className="py-24 bg-surface" id="features">
      <div className="max-w-7xl mx-auto px-container_padding">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-4">Core Capabilities</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Everything you need to manage assets, coordinate teams, and maintain operational continuity in one unified platform.
          </p>
        </div>
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
          {/* Feature 1: Large Span */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-card_padding border border-outline-variant/20 shadow-level-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-level-2 hover:border-primary/10 flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-container-blue text-primary flex items-center justify-center mb-6">
                <MaterialIcon name="calendar_month" />
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Intelligent Scheduling</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Automate preventative maintenance schedules based on real-time asset usage and historical performance data. Minimize unplanned downtime.
              </p>
            </div>
            {/* Decorative Graphic */}
            <div className="mt-8 flex gap-2 w-full h-24 items-end opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="w-1/6 h-[40%] bg-surface-container-high rounded-t-sm"></div>
              <div className="w-1/6 h-[60%] bg-surface-container-high rounded-t-sm"></div>
              <div className="w-1/6 h-[80%] bg-surface-tint/40 rounded-t-sm"></div>
              <div className="w-1/6 h-[50%] bg-surface-container-high rounded-t-sm"></div>
              <div className="w-1/6 h-[100%] bg-primary rounded-t-sm relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-on-surface text-on-primary text-[10px] py-1 px-2 rounded">Today</div>
              </div>
              <div className="w-1/6 h-[30%] bg-surface-container-high rounded-t-sm"></div>
            </div>
          </div>
          {/* Feature 2: Standard Card */}
          <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-outline-variant/20 shadow-level-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-level-2 hover:border-primary/10 flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-surface-container text-primary flex items-center justify-center mb-6">
              <MaterialIcon name="precision_manufacturing" />
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Asset Tracking</h3>
            <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
              Maintain a comprehensive digital twin of your facility. Track lifecycle costs, warranty info, and repair history effortlessly.
            </p>
            <a className="mt-6 font-label-md text-label-md text-primary flex items-center gap-1 hover:underline w-fit" href="#">
              Explore Assets <MaterialIcon name="arrow_forward" style={{ fontSize: '16px' }} />
            </a>
          </div>
          {/* Feature 3: Standard Card */}
          <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-outline-variant/20 shadow-level-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-level-2 hover:border-primary/10 flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-surface-container text-primary flex items-center justify-center mb-6">
              <MaterialIcon name="group" />
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Team Performance</h3>
            <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
              Monitor technician workload, response times, and completion rates. Allocate resources dynamically based on skill sets and location.
            </p>
          </div>
          {/* Feature 4: Wide Interactive Span */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-card_padding border border-outline-variant/20 shadow-level-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-level-2 hover:border-primary/10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="inline-flex px-2 py-1 bg-error-container text-on-error-container font-label-sm text-[10px] rounded uppercase font-bold tracking-wider mb-4">Mobile Ready</div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Field Technician App</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Equip your team with a powerful mobile tool. Scan QR codes to pull up asset history, snap photos of issues, and close out work orders instantly from the facility floor.
              </p>
              <div className="flex gap-4">
                <button className="bg-surface-container hover:bg-surface-container-high text-on-surface p-2 rounded flex items-center gap-2 font-label-sm transition-colors border border-outline-variant/30">
                  <MaterialIcon name="ios" /> iOS App
                </button>
                <button className="bg-surface-container hover:bg-surface-container-high text-on-surface p-2 rounded flex items-center gap-2 font-label-sm transition-colors border border-outline-variant/30">
                  <MaterialIcon name="android" /> Android App
                </button>
              </div>
            </div>
            {/* Decorative Mobile Mockup Element */}
            <div className="w-48 h-64 bg-surface-bright rounded-2xl border-4 border-on-surface/10 overflow-hidden relative shadow-inner flex-shrink-0 hidden sm:block">
              {/* Screen Header */}
              <div className="bg-primary text-on-primary p-3 flex justify-between items-center">
                <MaterialIcon name="menu" className="text-[16px]" />
                <span className="font-label-sm text-xs font-semibold">Work Order #492</span>
                <MaterialIcon name="search" className="text-[16px]" />
              </div>
              {/* Screen Content */}
              <div className="p-3 space-y-3">
                <div className="h-4 bg-outline-variant/30 w-3/4 rounded"></div>
                <div className="h-3 bg-outline-variant/20 w-1/2 rounded"></div>
                <div className="flex gap-2 pt-2">
                  <div className="w-8 h-8 rounded bg-surface-container-high"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-outline-variant/20 w-full rounded"></div>
                    <div className="h-2 bg-outline-variant/20 w-4/5 rounded"></div>
                  </div>
                </div>
                <div className="mt-auto absolute bottom-4 left-3 right-3 h-8 bg-success rounded flex items-center justify-center text-on-primary font-label-sm text-[10px]">
                  COMPLETE TASK
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
