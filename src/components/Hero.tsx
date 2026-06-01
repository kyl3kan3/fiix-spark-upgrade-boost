import MaterialIcon from '@/components/ui/material-icon';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <header className="relative pt-24 pb-32 overflow-hidden bg-surface-bright">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 bg-surface-tint/10 rounded-full blur-3xl opacity-50"></div>
      <div className="max-w-7xl mx-auto px-container_padding relative z-10 flex flex-col md:flex-row items-center gap-12">
        {/* Hero Content */}
        <div className="flex-1 text-center md:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-primary mb-2">
            <MaterialIcon name="bolt" style={{ fontSize: '16px' }} />
            New: AI-Powered Predictive Maintenance
          </div>
          <h1 className="font-display-lg text-display-lg text-on-background md:hidden">Facility Excellence, Engineered.</h1>
          <h1 className="font-display-lg text-display-lg text-on-background hidden md:block">Facility Excellence,<br />Engineered.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto md:mx-0">
            Streamline workflows, reduce downtime, and empower your team with an intelligent CMMS designed for modern facility operations. Precision meets utility.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
            <a
              className="w-full sm:w-auto font-label-md text-label-md bg-primary text-on-primary px-8 py-4 rounded-lg hover:bg-primary-container transition-colors uppercase text-center shadow-md active:scale-95 transition-transform cursor-pointer"
              onClick={() => navigate('/auth?signup=true')}
            >
              Start Free Trial
            </a>
            <a
              className="w-full sm:w-auto font-label-md text-label-md text-primary bg-transparent border border-outline-variant hover:border-primary px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => navigate('/auth')}
            >
              <MaterialIcon name="play_circle" />
              Watch Demo
            </a>
          </div>
          <div className="pt-8 flex items-center justify-center md:justify-start gap-6 text-on-surface-variant/60 font-label-sm text-label-sm">
            <div className="flex items-center gap-1">
              <MaterialIcon name="check_circle" style={{ fontSize: '18px' }} />
              No credit card required
            </div>
            <div className="flex items-center gap-1">
              <MaterialIcon name="check_circle" style={{ fontSize: '18px' }} />
              14-day full access
            </div>
          </div>
        </div>

        {/* Hero Visual (Bento Preview) */}
        <div className="flex-1 w-full max-w-lg relative">
          <div className="w-full h-auto aspect-[4/3] rounded-xl overflow-hidden shadow-level-2 relative border border-outline-variant/20 bg-surface">
            <img
              alt="Facility manager using a tablet to inspect modern industrial equipment in a clean, brightly lit manufacturing environment."
              className="w-full h-full object-cover opacity-90 mix-blend-multiply"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2cdvQeTNbw1b3CyJnEumf72xxwtXK7_MOfFHxjZfYLNHbvj0jqRYwhNtmhp1B5-Md0T6k_ev7ODBiKIVSuV_e1nL5UrOzS31Z3ZNtvfiThc_R2CY9zorw1xIqORnu_r0PoY78YhUx5EK9E2E-fieynHxOCUTzyLYH2FjwlYy91SwbE59zGEo89hiG-H2yT1qR-Vhr7f0GDxORPy8hpiyC9pQMNRXJGbBxyeEZcTj0BzM_ZgTeFOj8uE_G3_X2v6ZIlMkjEIQuCp4"
            />
            {/* Overlay UI Elements */}
            <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-outline-variant/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                <MaterialIcon name="check_circle" />
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface">System Status</div>
                <div className="font-body-sm text-xs text-success font-medium">Optimal (99.9%)</div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-outline-variant/30">
              <div className="flex justify-between items-center mb-2">
                <div className="font-label-md text-label-md text-on-surface">Weekly Work Orders</div>
                <MaterialIcon name="trending_up" className="text-primary" />
              </div>
              {/* Simulated Progress Chart */}
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden flex">
                <div className="h-full bg-primary w-[70%]"></div>
                <div className="h-full bg-warning w-[20%]"></div>
                <div className="h-full bg-error w-[10%]"></div>
              </div>
              <div className="flex justify-between mt-2 font-label-sm text-[10px] text-on-surface-variant">
                <span>Completed (70%)</span>
                <span>Pending (20%)</span>
                <span>Overdue (10%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
