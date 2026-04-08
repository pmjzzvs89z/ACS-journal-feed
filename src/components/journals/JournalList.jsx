// All journals organized by publisher, chemistry subfield, and field of science

export const CHEMISTRY_CATEGORIES = [
  'General',
  'Analytical Chemistry',
  'Biological/Medicinal Chemistry',
  'Physical/Theoretical Chemistry',
  'Inorganic/Materials Chemistry',
  'Polymers/Macromolecules',
  'Organic Chemistry',
  'Applied/Industrial Chemistry',
];

export const ACS_JOURNALS = [
  // General
  { id: 'jacs', name: 'Journal of the American Chemical Society', abbrev: 'JACS', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jacsat', color: '#0066b3', category: 'General' },
  { id: 'chemrev', name: 'Chemical Reviews', abbrev: 'Chem. Rev.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=chreay', color: '#198754', category: 'General' },
  { id: 'accounts', name: 'Accounts of Chemical Research', abbrev: 'Acc. Chem. Res.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=achre4', color: '#27ae60', category: 'General' },
  { id: 'acscentsci', name: 'ACS Central Science', abbrev: 'ACS Cent. Sci.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=acscii', color: '#d63384', category: 'General' },
  { id: 'acsmacrolett', name: 'ACS Macro Letters', abbrev: 'ACS Macro Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amlccd', color: '#6f42c1', category: 'Polymers/Macromolecules' },
  { id: 'acsomega', name: 'ACS Omega', abbrev: 'ACS Omega', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=acsodf', color: '#17a2b8', category: 'General' },
  { id: 'acslettmater', name: 'ACS Materials Letters', abbrev: 'ACS Mater. Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amlcef', color: '#2e86c1', category: 'General' },
  { id: 'accountsmr', name: 'Accounts of Materials Research', abbrev: 'Acc. Mater. Res.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amrcda', color: '#0d6efd', category: 'General' },

  // Analytical Chemistry
  { id: 'analchem', name: 'Analytical Chemistry', abbrev: 'Anal. Chem.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ancham', color: '#e85d00', category: 'Analytical Chemistry' },
  { id: 'acssensors', name: 'ACS Sensors', abbrev: 'ACS Sens.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ascefj', color: '#ff6b35', category: 'Analytical Chemistry' },
  { id: 'acsmeasursciau', name: 'ACS Measurement Science Au', abbrev: 'ACS Meas. Sci. Au', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amachv', color: '#d35400', category: 'Analytical Chemistry' },
  { id: 'jproteomeres', name: 'Journal of Proteome Research', abbrev: 'J. Proteome Res.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jprobs', color: '#c0392b', category: 'Analytical Chemistry' },
  { id: 'jchemeduc', name: 'Journal of Chemical Education', abbrev: 'J. Chem. Educ.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jceda8', color: '#f39c12', category: 'Analytical Chemistry' },
  { id: 'acschealthsaf', name: 'ACS Chemical Health & Safety', abbrev: 'ACS Chem. Health Saf.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=achsc5', color: '#dc3545', category: 'Analytical Chemistry' },

  // Biological/Medicinal Chemistry
  { id: 'biochem', name: 'Biochemistry', abbrev: 'Biochemistry', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=bichaw', color: '#0d6efd', category: 'Biological/Medicinal Chemistry' },
  { id: 'jmedchem', name: 'Journal of Medicinal Chemistry', abbrev: 'J. Med. Chem.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jmcmar', color: '#1d6fa4', category: 'Biological/Medicinal Chemistry' },
  { id: 'molpharma', name: 'Molecular Pharmaceutics', abbrev: 'Mol. Pharm.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=mpohbp', color: '#5b6abf', category: 'Biological/Medicinal Chemistry' },
  { id: 'acschembio', name: 'ACS Chemical Biology', abbrev: 'ACS Chem. Biol.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=acbcct', color: '#2980b9', category: 'Biological/Medicinal Chemistry' },
  { id: 'acsinfectdis', name: 'ACS Infectious Diseases', abbrev: 'ACS Infect. Dis.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aidcbc', color: '#e74c3c', category: 'Biological/Medicinal Chemistry' },
  { id: 'bioconjchem', name: 'Bioconjugate Chemistry', abbrev: 'Bioconjug. Chem.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=bcches', color: '#2e86ab', category: 'Biological/Medicinal Chemistry' },
  { id: 'chemneuro', name: 'ACS Chemical Neuroscience', abbrev: 'ACS Chem. Neurosci.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=acncdm', color: '#8e44ad', category: 'Biological/Medicinal Chemistry' },
  { id: 'acspharmbiotech', name: 'ACS Pharmacology & Translational Science', abbrev: 'ACS Pharmacol.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aptsfn', color: '#2471a3', category: 'Biological/Medicinal Chemistry' },
  { id: 'acsbiomater', name: 'ACS Biomaterials Science & Engineering', abbrev: 'ACS Biomater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=abseba', color: '#16a085', category: 'Biological/Medicinal Chemistry' },
  { id: 'acsapplbiomat', name: 'ACS Applied Bio Materials', abbrev: 'ACS Appl. Bio Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aabmcb', color: '#1abc9c', category: 'Biological/Medicinal Chemistry' },
  { id: 'acsbiomedau', name: 'ACS Bio & Med Chem Au', abbrev: 'ACS Bio Med Chem Au', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=abmcb8', color: '#0d6efd', category: 'Biological/Medicinal Chemistry' },

  // Physical/Theoretical Chemistry
  { id: 'jpclett', name: 'Journal of Physical Chemistry Letters', abbrev: 'J. Phys. Chem. Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jpclcd', color: '#fd7e14', category: 'Physical/Theoretical Chemistry' },
  { id: 'jpca', name: 'Journal of Physical Chemistry A', abbrev: 'J. Phys. Chem. A', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jpcafh', color: '#f39c12', category: 'Physical/Theoretical Chemistry' },
  { id: 'jpcb', name: 'Journal of Physical Chemistry B', abbrev: 'J. Phys. Chem. B', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jpcbfk', color: '#e67e22', category: 'Physical/Theoretical Chemistry' },
  { id: 'jpcc', name: 'Journal of Physical Chemistry C', abbrev: 'J. Phys. Chem. C', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jpccck', color: '#d35400', category: 'Physical/Theoretical Chemistry' },
  { id: 'jctc', name: 'Journal of Chemical Theory and Computation', abbrev: 'J. Chem. Theory Comput.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jctcce', color: '#c0392b', category: 'Physical/Theoretical Chemistry' },
  { id: 'jcim', name: 'Journal of Chemical Information and Modeling', abbrev: 'J. Chem. Inf. Model.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jcisd8', color: '#e74c3c', category: 'Physical/Theoretical Chemistry' },
  { id: 'jpcl', name: 'ACS Physical Chemistry Au', abbrev: 'ACS Phys. Chem. Au', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=apcach', color: '#fd7e14', category: 'Physical/Theoretical Chemistry' },

  // Inorganic/Materials Chemistry
  { id: 'inorgchem', name: 'Inorganic Chemistry', abbrev: 'Inorg. Chem.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=inocaj', color: '#20c997', category: 'Inorganic/Materials Chemistry' },
  { id: 'acsnano', name: 'ACS Nano', abbrev: 'ACS Nano', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ancac3', color: '#7b2d8e', category: 'Inorganic/Materials Chemistry' },
  { id: 'nanolett', name: 'Nano Letters', abbrev: 'Nano Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=nalefd', color: '#6610f2', category: 'Inorganic/Materials Chemistry' },
  { id: 'acsami', name: 'ACS Applied Materials & Interfaces', abbrev: 'ACS AMI', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aamick', color: '#00875a', category: 'Inorganic/Materials Chemistry' },
  { id: 'chemmater', name: 'Chemistry of Materials', abbrev: 'Chem. Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=cmatex', color: '#16a085', category: 'Inorganic/Materials Chemistry' },
  { id: 'langmuir', name: 'Langmuir', abbrev: 'Langmuir', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=langd5', color: '#17a2b8', category: 'Inorganic/Materials Chemistry' },
  { id: 'crystgrowthdes', name: 'Crystal Growth & Design', abbrev: 'Cryst. Growth Des.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=cgdefu', color: '#1abc9c', category: 'Inorganic/Materials Chemistry' },
  { id: 'acsnanomaterials', name: 'ACS Applied Nano Materials', abbrev: 'ACS Appl. Nano Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aanmf6', color: '#5dade2', category: 'Inorganic/Materials Chemistry' },
  { id: 'acsapplelectrmat', name: 'ACS Applied Electronic Materials', abbrev: 'ACS Appl. Electron. Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaembp', color: '#6610f2', category: 'Inorganic/Materials Chemistry' },
  { id: 'acsapplenergymat', name: 'ACS Applied Energy Materials', abbrev: 'ACS Appl. Energy Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaemcq', color: '#ffc107', category: 'Inorganic/Materials Chemistry' },
  { id: 'acsapplengmat', name: 'ACS Applied Engineering Materials', abbrev: 'ACS Appl. Eng. Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaemdr', color: '#6c757d', category: 'Inorganic/Materials Chemistry' },
  { id: 'acsapploptmat', name: 'ACS Applied Optical Materials', abbrev: 'ACS Appl. Opt. Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaoma6', color: '#0066b3', category: 'Inorganic/Materials Chemistry' },
  { id: 'macromolecules', name: 'Macromolecules', abbrev: 'Macromolecules', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=mamobx', color: '#e91e8c', category: 'Polymers/Macromolecules' },

  // Organic Chemistry
  { id: 'orglett', name: 'Organic Letters', abbrev: 'Org. Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=orlef7', color: '#d63384', category: 'Organic Chemistry' },
  { id: 'joc', name: 'Journal of Organic Chemistry', abbrev: 'J. Org. Chem.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=joceah', color: '#6f42c1', category: 'Organic Chemistry' },
  { id: 'acscatal', name: 'ACS Catalysis', abbrev: 'ACS Catal.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=accacs', color: '#dc3545', category: 'Organic Chemistry' },
  { id: 'orgprocess', name: 'Organic Process Research & Development', abbrev: 'Org. Process Res. Dev.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=oprdfk', color: '#c0392b', category: 'Organic Chemistry' },
  { id: 'acssynthbiol', name: 'ACS Synthetic Biology', abbrev: 'ACS Synth. Biol.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=asbcd6', color: '#e91e8c', category: 'Organic Chemistry' },
  { id: 'organometallics', name: 'Organometallics', abbrev: 'Organometallics', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=orgnd7', color: '#8e44ad', category: 'Organic Chemistry' },
  { id: 'jnatprod', name: 'Journal of Natural Products', abbrev: 'J. Nat. Prod.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jnprdf', color: '#27ae60', category: 'Organic Chemistry' },
  { id: 'acsorgsynthau', name: 'ACS Organic & Inorganic Au', abbrev: 'ACS Org. Inorg. Au', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aoiab5', color: '#c0392b', category: 'Organic Chemistry' },

  // Applied/Industrial Chemistry
  { id: 'iecr', name: 'Industrial & Engineering Chemistry Research', abbrev: 'Ind. Eng. Chem. Res.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=iecred', color: '#6c757d', category: 'Applied/Industrial Chemistry' },
  { id: 'acsenergylett', name: 'ACS Energy Letters', abbrev: 'ACS Energy Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aelccp', color: '#ffc107', category: 'Applied/Industrial Chemistry' },
  { id: 'envscitechnol', name: 'Environmental Science & Technology', abbrev: 'Environ. Sci. Technol.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=esthag', color: '#28a745', category: 'Applied/Industrial Chemistry' },
  { id: 'envscitechnollett', name: 'Environmental Science & Technology Letters', abbrev: 'Environ. Sci. Technol. Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=estlcu', color: '#20c997', category: 'Applied/Industrial Chemistry' },
  { id: 'acsapplpolym', name: 'ACS Applied Polymer Materials', abbrev: 'ACS Appl. Polym. Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aapmcd', color: '#495057', category: 'Polymers/Macromolecules' },
  { id: 'acssustainchem', name: 'ACS Sustainable Chemistry & Engineering', abbrev: 'ACS Sustain. Chem. Eng.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ascecg', color: '#2ecc71', category: 'Applied/Industrial Chemistry' },
  { id: 'acsfoodscitech', name: 'ACS Food Science & Technology', abbrev: 'ACS Food Sci. Technol.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=afsthl', color: '#f1c40f', category: 'Applied/Industrial Chemistry' },
  { id: 'acsagriscitechau', name: 'ACS Agricultural Science & Technology', abbrev: 'ACS Agric. Sci. Technol.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aastgj', color: '#198754', category: 'Applied/Industrial Chemistry' },
  { id: 'acssustresourcau', name: 'ACS Sustainable Resource Management', abbrev: 'ACS Sustain. Resour. Manag.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=asrmcm', color: '#2ecc71', category: 'Applied/Industrial Chemistry' },
];

export const RSC_JOURNALS = [
  // General
  { id: 'rsc_chemscience', name: 'Chemical Science', abbrev: 'Chem. Sci.', rss_url: 'https://pubs.rsc.org/rss/sc', color: '#e74c3c', category: 'General' },
  { id: 'rsc_chemcomm', name: 'Chemical Communications', abbrev: 'Chem. Commun.', rss_url: 'https://pubs.rsc.org/rss/cc', color: '#f39c12', category: 'General' },
  { id: 'rsc_chemsoc', name: 'Chemical Society Reviews', abbrev: 'Chem. Soc. Rev.', rss_url: 'https://pubs.rsc.org/rss/cs', color: '#0066b3', category: 'General' },
  { id: 'rsc_rscchembd', name: 'RSC Chemical Biology', abbrev: 'RSC Chem. Biol.', rss_url: 'https://pubs.rsc.org/rss/cb', color: '#27ae60', category: 'General' },
  { id: 'rsc_newjchem', name: 'New Journal of Chemistry', abbrev: 'New J. Chem.', rss_url: 'https://pubs.rsc.org/rss/nj', color: '#e74c3c', category: 'General' },

  // Analytical Chemistry
  { id: 'rsc_analyst', name: 'Analyst', abbrev: 'Analyst', rss_url: 'https://pubs.rsc.org/rss/an', color: '#e85d00', category: 'Analytical Chemistry' },
  { id: 'rsc_analytmethods', name: 'Analytical Methods', abbrev: 'Anal. Methods', rss_url: 'https://pubs.rsc.org/rss/ay', color: '#d35400', category: 'Analytical Chemistry' },
  { id: 'rsc_jaas', name: 'Journal of Analytical Atomic Spectrometry', abbrev: 'JAAS', rss_url: 'https://pubs.rsc.org/rss/ja', color: '#c0392b', category: 'Analytical Chemistry' },
  { id: 'rsc_labchip', name: 'Lab on a Chip', abbrev: 'Lab Chip', rss_url: 'https://pubs.rsc.org/rss/lc', color: '#e74c3c', category: 'Analytical Chemistry' },
  { id: 'rsc_sensact', name: 'Sensors & Diagnostics', abbrev: 'Sens. Diagn.', rss_url: 'https://pubs.rsc.org/rss/sd', color: '#f39c12', category: 'Analytical Chemistry' },

  // Biological/Medicinal Chemistry
  { id: 'rsc_medchemcomm', name: 'RSC Medicinal Chemistry', abbrev: 'RSC Med. Chem.', rss_url: 'https://pubs.rsc.org/rss/md', color: '#2980b9', category: 'Biological/Medicinal Chemistry' },
  { id: 'rsc_biomaterscience', name: 'Biomaterials Science', abbrev: 'Biomater. Sci.', rss_url: 'https://pubs.rsc.org/rss/bm', color: '#16a085', category: 'Biological/Medicinal Chemistry' },
  { id: 'rsc_rscpharma', name: 'RSC Pharmaceutics', abbrev: 'RSC Pharm.', rss_url: 'https://pubs.rsc.org/rss/pm', color: '#3498db', category: 'Biological/Medicinal Chemistry' },
  { id: 'rsc_foodfunct', name: 'Food & Function', abbrev: 'Food Funct.', rss_url: 'https://pubs.rsc.org/rss/fo', color: '#e67e22', category: 'Biological/Medicinal Chemistry' },

  // Physical/Theoretical Chemistry
  { id: 'rsc_pccp', name: 'Physical Chemistry Chemical Physics', abbrev: 'PCCP', rss_url: 'https://pubs.rsc.org/rss/cp', color: '#fd7e14', category: 'Physical/Theoretical Chemistry' },
  { id: 'rsc_faraday', name: 'Faraday Discussions', abbrev: 'Faraday Discuss.', rss_url: 'https://pubs.rsc.org/rss/fd', color: '#e67e22', category: 'Physical/Theoretical Chemistry' },
  { id: 'rsc_molsyst', name: 'Molecular Systems Design & Engineering', abbrev: 'Mol. Syst. Des. Eng.', rss_url: 'https://pubs.rsc.org/rss/me', color: '#f39c12', category: 'Physical/Theoretical Chemistry' },
  { id: 'rsc_digidisc', name: 'Digital Discovery', abbrev: 'Digital Discovery', rss_url: 'https://pubs.rsc.org/rss/dd', color: '#6610f2', category: 'Physical/Theoretical Chemistry' },

  // Inorganic/Materials Chemistry
  { id: 'rsc_dalton', name: 'Dalton Transactions', abbrev: 'Dalton Trans.', rss_url: 'https://pubs.rsc.org/rss/dt', color: '#20c997', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_crystengcomm', name: 'CrystEngComm', abbrev: 'CrystEngComm', rss_url: 'https://pubs.rsc.org/rss/ce', color: '#1abc9c', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_nanoscale', name: 'Nanoscale', abbrev: 'Nanoscale', rss_url: 'https://pubs.rsc.org/rss/nr', color: '#7b2d8e', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_nanoscaleadv', name: 'Nanoscale Advances', abbrev: 'Nanoscale Adv.', rss_url: 'https://pubs.rsc.org/rss/na', color: '#6c3483', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_nanoscalehoriz', name: 'Nanoscale Horizons', abbrev: 'Nanoscale Horiz.', rss_url: 'https://pubs.rsc.org/rss/nh', color: '#5b2d8e', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_jmaterchemc', name: 'Journal of Materials Chemistry C', abbrev: 'J. Mater. Chem. C', rss_url: 'https://pubs.rsc.org/rss/tc', color: '#2e86c1', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_jmaterchema', name: 'Journal of Materials Chemistry A', abbrev: 'J. Mater. Chem. A', rss_url: 'https://pubs.rsc.org/rss/ta', color: '#117a65', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_jmaterchemb', name: 'Journal of Materials Chemistry B', abbrev: 'J. Mater. Chem. B', rss_url: 'https://pubs.rsc.org/rss/tb', color: '#1a5276', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_inorgchemfront', name: 'Inorganic Chemistry Frontiers', abbrev: 'Inorg. Chem. Front.', rss_url: 'https://pubs.rsc.org/rss/qi', color: '#148f77', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_materadv', name: 'Materials Advances', abbrev: 'Mater. Adv.', rss_url: 'https://pubs.rsc.org/rss/ma', color: '#0d6efd', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_materchemfront', name: 'Materials Chemistry Frontiers', abbrev: 'Mater. Chem. Front.', rss_url: 'https://pubs.rsc.org/rss/qm', color: '#0a9396', category: 'Inorganic/Materials Chemistry' },
  { id: 'rsc_materhorizons', name: 'Materials Horizons', abbrev: 'Mater. Horiz.', rss_url: 'https://pubs.rsc.org/rss/mh', color: '#005f73', category: 'Inorganic/Materials Chemistry' },

  // Organic Chemistry
  { id: 'rsc_orgbiomolchem', name: 'Organic & Biomolecular Chemistry', abbrev: 'Org. Biomol. Chem.', rss_url: 'https://pubs.rsc.org/rss/ob', color: '#d63384', category: 'Organic Chemistry' },
  { id: 'rsc_natprodreports', name: 'Natural Product Reports', abbrev: 'Nat. Prod. Rep.', rss_url: 'https://pubs.rsc.org/rss/np', color: '#c0392b', category: 'Organic Chemistry' },
  { id: 'rsc_greenchem', name: 'Green Chemistry', abbrev: 'Green Chem.', rss_url: 'https://pubs.rsc.org/rss/gc', color: '#27ae60', category: 'Organic Chemistry' },
  { id: 'rsc_catal', name: 'Catalysis Science & Technology', abbrev: 'Catal. Sci. Technol.', rss_url: 'https://pubs.rsc.org/rss/cy', color: '#dc3545', category: 'Organic Chemistry' },
  { id: 'rsc_orgchemfront', name: 'Organic Chemistry Frontiers', abbrev: 'Org. Chem. Front.', rss_url: 'https://pubs.rsc.org/rss/qo', color: '#6f42c1', category: 'Organic Chemistry' },
  { id: 'rsc_rscmechano', name: 'RSC Mechanochemistry', abbrev: 'RSC Mechanochem.', rss_url: 'https://pubs.rsc.org/rss/mr', color: '#e91e8c', category: 'Organic Chemistry' },

  // Applied/Industrial Chemistry
  { id: 'rsc_energyenviron', name: 'Energy & Environmental Science', abbrev: 'Energy Environ. Sci.', rss_url: 'https://pubs.rsc.org/rss/ee', color: '#28a745', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_rscadv', name: 'RSC Advances', abbrev: 'RSC Adv.', rss_url: 'https://pubs.rsc.org/rss/ra', color: '#6c757d', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_sustenergy', name: 'Sustainable Energy & Fuels', abbrev: 'Sustain. Energy Fuels', rss_url: 'https://pubs.rsc.org/rss/se', color: '#2ecc71', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_react_chem_eng', name: 'Reaction Chemistry & Engineering', abbrev: 'React. Chem. Eng.', rss_url: 'https://pubs.rsc.org/rss/re', color: '#f39c12', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_envsciwat', name: 'Environmental Science: Water Research & Technology', abbrev: 'Environ. Sci.: Water', rss_url: 'https://pubs.rsc.org/rss/ew', color: '#2980b9', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_envscinatno', name: 'Environmental Science: Nano', abbrev: 'Environ. Sci.: Nano', rss_url: 'https://pubs.rsc.org/rss/en', color: '#148f77', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_envsciatm', name: 'Environmental Science: Atmospheres', abbrev: 'Environ. Sci.: Atmos.', rss_url: 'https://pubs.rsc.org/rss/ea', color: '#0a9396', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_envsciproc', name: 'Environmental Science: Processes & Impacts', abbrev: 'Environ. Sci.: Process.', rss_url: 'https://pubs.rsc.org/rss/em', color: '#17a2b8', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_envscienv', name: 'Environmental Science: Advances', abbrev: 'Environ. Sci.: Adv.', rss_url: 'https://pubs.rsc.org/rss/va', color: '#20c997', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_eesbatt', name: 'EES Batteries', abbrev: 'EES Batteries', rss_url: 'https://pubs.rsc.org/rss/eb', color: '#ffc107', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_eescatal', name: 'EES Catalysis', abbrev: 'EES Catalysis', rss_url: 'https://pubs.rsc.org/rss/ey', color: '#fd7e14', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_eessolar', name: 'EES Solar', abbrev: 'EES Solar', rss_url: 'https://pubs.rsc.org/rss/el', color: '#e67e22', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_energyadv', name: 'Energy Advances', abbrev: 'Energy Adv.', rss_url: 'https://pubs.rsc.org/rss/ya', color: '#f39c12', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_indchemmat', name: 'Industrial Chemistry & Materials', abbrev: 'Ind. Chem. Mater.', rss_url: 'https://pubs.rsc.org/rss/im', color: '#6c757d', category: 'Applied/Industrial Chemistry' },
  { id: 'rsc_rscsustain', name: 'RSC Sustainability', abbrev: 'RSC Sustain.', rss_url: 'https://pubs.rsc.org/rss/su', color: '#2ecc71', category: 'Applied/Industrial Chemistry' },

  // Polymers/Macromolecules
  { id: 'rsc_polym', name: 'Polymer Chemistry', abbrev: 'Polym. Chem.', rss_url: 'https://pubs.rsc.org/rss/py', color: '#6f42c1', category: 'Polymers/Macromolecules' },
  { id: 'rsc_softmatter', name: 'Soft Matter', abbrev: 'Soft Matter', rss_url: 'https://pubs.rsc.org/rss/sm', color: '#8e44ad', category: 'Polymers/Macromolecules' },
  { id: 'rsc_rscapplpolym', name: 'RSC Applied Polymers', abbrev: 'RSC Appl. Polym.', rss_url: 'https://pubs.rsc.org/rss/lp', color: '#6c3483', category: 'Polymers/Macromolecules' },
  { id: 'rsc_rscapplinterf', name: 'RSC Applied Interfaces', abbrev: 'RSC Appl. Interfaces', rss_url: 'https://pubs.rsc.org/rss/lf', color: '#495057', category: 'Polymers/Macromolecules' },
];

export const WILEY_JOURNALS = [
  // General
  { id: 'wiley_angew', name: 'Angewandte Chemie International Edition', abbrev: 'Angew. Chem. Int. Ed.', rss_url: 'https://onlinelibrary.wiley.com/feed/15213773/most-recent', color: '#0066b3', category: 'General' },
  { id: 'wiley_chemeur', name: 'Chemistry – A European Journal', abbrev: 'Chem. Eur. J.', rss_url: 'https://onlinelibrary.wiley.com/feed/15213765/most-recent', color: '#6f42c1', category: 'General' },
  { id: 'wiley_chemasia', name: 'Chemistry – An Asian Journal', abbrev: 'Chem. Asian J.', rss_url: 'https://onlinelibrary.wiley.com/feed/1861471x/most-recent', color: '#e74c3c', category: 'General' },
  { id: 'wiley_chempluschem', name: 'ChemPlusChem', abbrev: 'ChemPlusChem', rss_url: 'https://onlinelibrary.wiley.com/feed/21926506/most-recent', color: '#27ae60', category: 'General' },

  // Analytical Chemistry
  { id: 'wiley_jac', name: 'Journal of Separation Science', abbrev: 'J. Sep. Sci.', rss_url: 'https://onlinelibrary.wiley.com/feed/16159314/most-recent', color: '#e85d00', category: 'Analytical Chemistry' },
  { id: 'wiley_electrophoresis', name: 'Electrophoresis', abbrev: 'Electrophoresis', rss_url: 'https://onlinelibrary.wiley.com/feed/15222683/most-recent', color: '#d35400', category: 'Analytical Chemistry' },
  { id: 'wiley_jms', name: 'Journal of Mass Spectrometry', abbrev: 'J. Mass Spectrom.', rss_url: 'https://onlinelibrary.wiley.com/feed/10969888/most-recent', color: '#c0392b', category: 'Analytical Chemistry' },

  // Biological/Medicinal Chemistry
  { id: 'wiley_chembiochem', name: 'ChemBioChem', abbrev: 'ChemBioChem', rss_url: 'https://onlinelibrary.wiley.com/feed/14397633/most-recent', color: '#2980b9', category: 'Biological/Medicinal Chemistry' },
  { id: 'wiley_chemmedchem', name: 'ChemMedChem', abbrev: 'ChemMedChem', rss_url: 'https://onlinelibrary.wiley.com/feed/18607187/most-recent', color: '#1d6fa4', category: 'Biological/Medicinal Chemistry' },
  { id: 'wiley_archpharm', name: 'Archiv der Pharmazie', abbrev: 'Arch. Pharm.', rss_url: 'https://onlinelibrary.wiley.com/feed/15214184/most-recent', color: '#5b6abf', category: 'Biological/Medicinal Chemistry' },
  { id: 'wiley_jpharmscience', name: 'Journal of Pharmaceutical Sciences', abbrev: 'J. Pharm. Sci.', rss_url: 'https://onlinelibrary.wiley.com/feed/15206017/most-recent', color: '#8e44ad', category: 'Biological/Medicinal Chemistry' },

  // Physical/Theoretical Chemistry
  { id: 'wiley_chemphyschem', name: 'ChemPhysChem', abbrev: 'ChemPhysChem', rss_url: 'https://onlinelibrary.wiley.com/feed/14397641/most-recent', color: '#fd7e14', category: 'Physical/Theoretical Chemistry' },
  { id: 'wiley_jcc', name: 'Journal of Computational Chemistry', abbrev: 'J. Comput. Chem.', rss_url: 'https://onlinelibrary.wiley.com/feed/1096987x/most-recent', color: '#e67e22', category: 'Physical/Theoretical Chemistry' },
  { id: 'wiley_ijqc', name: 'International Journal of Quantum Chemistry', abbrev: 'Int. J. Quantum Chem.', rss_url: 'https://onlinelibrary.wiley.com/feed/1097461x/most-recent', color: '#f39c12', category: 'Physical/Theoretical Chemistry' },

  // Inorganic/Materials Chemistry
  { id: 'wiley_ejic', name: 'European Journal of Inorganic Chemistry', abbrev: 'Eur. J. Inorg. Chem.', rss_url: 'https://onlinelibrary.wiley.com/feed/10990682/most-recent', color: '#20c997', category: 'Inorganic/Materials Chemistry' },
  { id: 'wiley_advmat', name: 'Advanced Materials', abbrev: 'Adv. Mater.', rss_url: 'https://onlinelibrary.wiley.com/feed/15214095/most-recent', color: '#7b2d8e', category: 'Inorganic/Materials Chemistry' },
  { id: 'wiley_advfuncmat', name: 'Advanced Functional Materials', abbrev: 'Adv. Funct. Mater.', rss_url: 'https://onlinelibrary.wiley.com/feed/16163028/most-recent', color: '#6610f2', category: 'Inorganic/Materials Chemistry' },
  { id: 'wiley_small', name: 'Small', abbrev: 'Small', rss_url: 'https://onlinelibrary.wiley.com/feed/16136829/most-recent', color: '#1abc9c', category: 'Inorganic/Materials Chemistry' },
  { id: 'wiley_zaac', name: 'Zeitschrift für anorganische und allgemeine Chemie', abbrev: 'Z. Anorg. Allg. Chem.', rss_url: 'https://onlinelibrary.wiley.com/feed/15213749/most-recent', color: '#16a085', category: 'Inorganic/Materials Chemistry' },

  // Organic Chemistry
  { id: 'wiley_ejoc', name: 'European Journal of Organic Chemistry', abbrev: 'Eur. J. Org. Chem.', rss_url: 'https://onlinelibrary.wiley.com/feed/10990690/most-recent', color: '#d63384', category: 'Organic Chemistry' },
  { id: 'wiley_helv', name: 'Helvetica Chimica Acta', abbrev: 'Helv. Chim. Acta', rss_url: 'https://onlinelibrary.wiley.com/feed/15222675/most-recent', color: '#c0392b', category: 'Organic Chemistry' },
  { id: 'wiley_chemcat', name: 'ChemCatChem', abbrev: 'ChemCatChem', rss_url: 'https://onlinelibrary.wiley.com/feed/18673899/most-recent', color: '#dc3545', category: 'Organic Chemistry' },
  { id: 'wiley_synthesis', name: 'Synthesis', abbrev: 'Synthesis', rss_url: 'https://www.thieme-connect.de/media/synthesis/rss/latest.rss', color: '#6f42c1', category: 'Organic Chemistry' },

  // Applied/Industrial Chemistry
  { id: 'wiley_aiche', name: 'AIChE Journal', abbrev: 'AIChE J.', rss_url: 'https://onlinelibrary.wiley.com/feed/15475905/most-recent', color: '#6c757d', category: 'Applied/Industrial Chemistry' },
  { id: 'wiley_chemsuschem', name: 'ChemSusChem', abbrev: 'ChemSusChem', rss_url: 'https://onlinelibrary.wiley.com/feed/18645631/most-recent', color: '#2ecc71', category: 'Applied/Industrial Chemistry' },
  { id: 'wiley_chemeng', name: 'Chemical Engineering & Technology', abbrev: 'Chem. Eng. Technol.', rss_url: 'https://onlinelibrary.wiley.com/feed/15214125/most-recent', color: '#e67e22', category: 'Applied/Industrial Chemistry' },
  { id: 'wiley_global', name: 'Global Challenges', abbrev: 'Global Challenges', rss_url: 'https://onlinelibrary.wiley.com/feed/20566646/most-recent', color: '#28a745', category: 'Applied/Industrial Chemistry' },
  // Polymers/Macromolecules
  { id: 'wiley_macromolchem', name: 'Macromolecular Chemistry and Physics', abbrev: 'Macromol. Chem. Phys.', rss_url: 'https://onlinelibrary.wiley.com/feed/15213935/most-recent', color: '#6f42c1', category: 'Polymers/Macromolecules' },
  { id: 'wiley_macromolrapid', name: 'Macromolecular Rapid Communications', abbrev: 'Macromol. Rapid Commun.', rss_url: 'https://onlinelibrary.wiley.com/feed/15213927/most-recent', color: '#8e44ad', category: 'Polymers/Macromolecules' },
  { id: 'wiley_jpolymscib', name: 'Journal of Polymer Science', abbrev: 'J. Polym. Sci.', rss_url: 'https://onlinelibrary.wiley.com/feed/26429071/most-recent', color: '#6c757d', category: 'Polymers/Macromolecules' },
  { id: 'wiley_polymerscience', name: 'Polymer International', abbrev: 'Polym. Int.', rss_url: 'https://onlinelibrary.wiley.com/feed/10970126/most-recent', color: '#495057', category: 'Polymers/Macromolecules' },
];

export const ELSEVIER_JOURNALS = [
  // General
  { id: 'elsevier_chemphyslett', name: 'Chemical Physics Letters', abbrev: 'Chem. Phys. Lett.', rss_url: 'https://rss.sciencedirect.com/publication/science/00092614', color: '#0066b3', category: 'General' },
  { id: 'elsevier_poly', name: 'Polyhedron', abbrev: 'Polyhedron', rss_url: 'https://rss.sciencedirect.com/publication/science/02775387', color: '#27ae60', category: 'General' },
  { id: 'elsevier_jmolstruct', name: 'Journal of Molecular Structure', abbrev: 'J. Mol. Struct.', rss_url: 'https://rss.sciencedirect.com/publication/science/00222860', color: '#e67e22', category: 'General' },

  // Analytical Chemistry
  { id: 'elsevier_talanta', name: 'Talanta', abbrev: 'Talanta', rss_url: 'https://rss.sciencedirect.com/publication/science/00399140', color: '#e85d00', category: 'Analytical Chemistry' },
  { id: 'elsevier_analytica', name: 'Analytica Chimica Acta', abbrev: 'Anal. Chim. Acta', rss_url: 'https://rss.sciencedirect.com/publication/science/00032670', color: '#d35400', category: 'Analytical Chemistry' },
  { id: 'elsevier_jchromatA', name: 'Journal of Chromatography A', abbrev: 'J. Chromatogr. A', rss_url: 'https://rss.sciencedirect.com/publication/science/00219673', color: '#c0392b', category: 'Analytical Chemistry' },
  { id: 'elsevier_jchromatB', name: 'Journal of Chromatography B', abbrev: 'J. Chromatogr. B', rss_url: 'https://rss.sciencedirect.com/publication/science/15700232', color: '#e74c3c', category: 'Analytical Chemistry' },
  { id: 'elsevier_spectrochim', name: 'Spectrochimica Acta Part A', abbrev: 'Spectrochim. Acta A', rss_url: 'https://rss.sciencedirect.com/publication/science/13861425', color: '#f39c12', category: 'Analytical Chemistry' },
  { id: 'elsevier_microchemj', name: 'Microchemical Journal', abbrev: 'Microchem. J.', rss_url: 'https://rss.sciencedirect.com/publication/science/0026265X', color: '#e67e22', category: 'Analytical Chemistry' },

  // Biological/Medicinal Chemistry
  { id: 'elsevier_ejmech', name: 'European Journal of Medicinal Chemistry', abbrev: 'Eur. J. Med. Chem.', rss_url: 'https://rss.sciencedirect.com/publication/science/02235234', color: '#2980b9', category: 'Biological/Medicinal Chemistry' },
  { id: 'elsevier_bioormed', name: 'Bioorganic & Medicinal Chemistry', abbrev: 'Bioorg. Med. Chem.', rss_url: 'https://rss.sciencedirect.com/publication/science/09680896', color: '#3498db', category: 'Biological/Medicinal Chemistry' },
  { id: 'elsevier_bioorglett', name: 'Bioorganic & Medicinal Chemistry Letters', abbrev: 'Bioorg. Med. Chem. Lett.', rss_url: 'https://rss.sciencedirect.com/publication/science/09600894', color: '#1abc9c', category: 'Biological/Medicinal Chemistry' },
  { id: 'elsevier_ejpb', name: 'European Journal of Pharmaceutics and Biopharmaceutics', abbrev: 'Eur. J. Pharm. Biopharm.', rss_url: 'https://rss.sciencedirect.com/publication/science/09396411', color: '#16a085', category: 'Biological/Medicinal Chemistry' },

  // Physical/Theoretical Chemistry
  { id: 'elsevier_chemphys', name: 'Chemical Physics', abbrev: 'Chem. Phys.', rss_url: 'https://rss.sciencedirect.com/publication/science/03010104', color: '#fd7e14', category: 'Physical/Theoretical Chemistry' },
  { id: 'elsevier_compchem', name: 'Computational and Theoretical Chemistry', abbrev: 'Comput. Theor. Chem.', rss_url: 'https://rss.sciencedirect.com/publication/science/2210271X', color: '#e67e22', category: 'Physical/Theoretical Chemistry' },
  { id: 'elsevier_jmolspec', name: 'Journal of Molecular Spectroscopy', abbrev: 'J. Mol. Spectrosc.', rss_url: 'https://rss.sciencedirect.com/publication/science/00222852', color: '#f39c12', category: 'Physical/Theoretical Chemistry' },

  // Inorganic/Materials Chemistry
  { id: 'elsevier_jalloy', name: 'Journal of Alloys and Compounds', abbrev: 'J. Alloys Compd.', rss_url: 'https://rss.sciencedirect.com/publication/science/09258388', color: '#20c997', category: 'Inorganic/Materials Chemistry' },
  { id: 'elsevier_carbon', name: 'Carbon', abbrev: 'Carbon', rss_url: 'https://rss.sciencedirect.com/publication/science/00086223', color: '#495057', category: 'Inorganic/Materials Chemistry' },
  { id: 'elsevier_jsolstat', name: 'Journal of Solid State Chemistry', abbrev: 'J. Solid State Chem.', rss_url: 'https://rss.sciencedirect.com/publication/science/00224596', color: '#7b2d8e', category: 'Inorganic/Materials Chemistry' },
  { id: 'elsevier_matchemphys', name: 'Materials Chemistry and Physics', abbrev: 'Mater. Chem. Phys.', rss_url: 'https://rss.sciencedirect.com/publication/science/02540584', color: '#6610f2', category: 'Inorganic/Materials Chemistry' },
  { id: 'elsevier_inochimacta', name: 'Inorganica Chimica Acta', abbrev: 'Inorg. Chim. Acta', rss_url: 'https://rss.sciencedirect.com/publication/science/00201693', color: '#1abc9c', category: 'Inorganic/Materials Chemistry' },

  // Organic Chemistry
  { id: 'elsevier_tet', name: 'Tetrahedron', abbrev: 'Tetrahedron', rss_url: 'https://rss.sciencedirect.com/publication/science/00404020', color: '#d63384', category: 'Organic Chemistry' },
  { id: 'elsevier_tetlett', name: 'Tetrahedron Letters', abbrev: 'Tetrahedron Lett.', rss_url: 'https://rss.sciencedirect.com/publication/science/00404039', color: '#6f42c1', category: 'Organic Chemistry' },
  { id: 'elsevier_jorgchem', name: 'Journal of Organometallic Chemistry', abbrev: 'J. Organomet. Chem.', rss_url: 'https://rss.sciencedirect.com/publication/science/0022328X', color: '#c0392b', category: 'Organic Chemistry' },
  { id: 'elsevier_catcomm', name: 'Catalysis Communications', abbrev: 'Catal. Commun.', rss_url: 'https://rss.sciencedirect.com/publication/science/15667367', color: '#dc3545', category: 'Organic Chemistry' },

  // Applied/Industrial Chemistry
  { id: 'elsevier_chemengsci', name: 'Chemical Engineering Science', abbrev: 'Chem. Eng. Sci.', rss_url: 'https://rss.sciencedirect.com/publication/science/00092509', color: '#6c757d', category: 'Applied/Industrial Chemistry' },
  { id: 'elsevier_fuel', name: 'Fuel', abbrev: 'Fuel', rss_url: 'https://rss.sciencedirect.com/publication/science/00162361', color: '#ffc107', category: 'Applied/Industrial Chemistry' },
  { id: 'elsevier_applenergy', name: 'Applied Energy', abbrev: 'Appl. Energy', rss_url: 'https://rss.sciencedirect.com/publication/science/03062619', color: '#28a745', category: 'Applied/Industrial Chemistry' },
  { id: 'elsevier_jhazmater', name: 'Journal of Hazardous Materials', abbrev: 'J. Hazard. Mater.', rss_url: 'https://rss.sciencedirect.com/publication/science/03043894', color: '#e74c3c', category: 'Applied/Industrial Chemistry' },
  // Polymers/Macromolecules
  { id: 'elsevier_polymer', name: 'Polymer', abbrev: 'Polymer', rss_url: 'https://rss.sciencedirect.com/publication/science/00323861', color: '#6c757d', category: 'Polymers/Macromolecules' },
  { id: 'elsevier_eurpolymj', name: 'European Polymer Journal', abbrev: 'Eur. Polym. J.', rss_url: 'https://rss.sciencedirect.com/publication/science/00143057', color: '#6f42c1', category: 'Polymers/Macromolecules' },
  { id: 'elsevier_reactfuncpolym', name: 'Reactive and Functional Polymers', abbrev: 'React. Funct. Polym.', rss_url: 'https://rss.sciencedirect.com/publication/science/13815148', color: '#8e44ad', category: 'Polymers/Macromolecules' },
  { id: 'elsevier_polydeg', name: 'Polymer Degradation and Stability', abbrev: 'Polym. Degrad. Stab.', rss_url: 'https://rss.sciencedirect.com/publication/science/01413910', color: '#c0392b', category: 'Polymers/Macromolecules' },
];

export const MDPI_JOURNALS = [
  // General
  { id: 'mdpi_molecules', name: 'Molecules', abbrev: 'Molecules', rss_url: 'https://www.mdpi.com/rss/journal/molecules', color: '#0066b3', category: 'General' },
  { id: 'mdpi_chemistry', name: 'Chemistry', abbrev: 'Chemistry (MDPI)', rss_url: 'https://www.mdpi.com/rss/journal/chemistry', color: '#27ae60', category: 'General' },
  { id: 'mdpi_applsci', name: 'Applied Sciences', abbrev: 'Appl. Sci.', rss_url: 'https://www.mdpi.com/rss/journal/applsci', color: '#e74c3c', category: 'General' },

  // Analytical Chemistry
  { id: 'mdpi_chemosensors', name: 'Chemosensors', abbrev: 'Chemosensors', rss_url: 'https://www.mdpi.com/rss/journal/chemosensors', color: '#e85d00', category: 'Analytical Chemistry' },
  { id: 'mdpi_analytica', name: 'Analytica', abbrev: 'Analytica', rss_url: 'https://www.mdpi.com/rss/journal/analytica', color: '#d35400', category: 'Analytical Chemistry' },
  { id: 'mdpi_separations', name: 'Separations', abbrev: 'Separations', rss_url: 'https://www.mdpi.com/rss/journal/separations', color: '#c0392b', category: 'Analytical Chemistry' },
  { id: 'mdpi_sensors', name: 'Sensors', abbrev: 'Sensors', rss_url: 'https://www.mdpi.com/rss/journal/sensors', color: '#e74c3c', category: 'Analytical Chemistry' },

  // Biological/Medicinal Chemistry
  { id: 'mdpi_pharmaceutics', name: 'Pharmaceutics', abbrev: 'Pharmaceutics', rss_url: 'https://www.mdpi.com/rss/journal/pharmaceutics', color: '#2980b9', category: 'Biological/Medicinal Chemistry' },
  { id: 'mdpi_ijms', name: 'International Journal of Molecular Sciences', abbrev: 'IJMS', rss_url: 'https://www.mdpi.com/rss/journal/ijms', color: '#1abc9c', category: 'Biological/Medicinal Chemistry' },
  { id: 'mdpi_pharmaceuticals', name: 'Pharmaceuticals', abbrev: 'Pharmaceuticals', rss_url: 'https://www.mdpi.com/rss/journal/pharmaceuticals', color: '#3498db', category: 'Biological/Medicinal Chemistry' },
  { id: 'mdpi_biomolecules', name: 'Biomolecules', abbrev: 'Biomolecules', rss_url: 'https://www.mdpi.com/rss/journal/biomolecules', color: '#8e44ad', category: 'Biological/Medicinal Chemistry' },
  { id: 'mdpi_marinedrugs', name: 'Marine Drugs', abbrev: 'Mar. Drugs', rss_url: 'https://www.mdpi.com/rss/journal/marinedrugs', color: '#2471a3', category: 'Biological/Medicinal Chemistry' },

  // Physical/Theoretical Chemistry
  { id: 'mdpi_physchem', name: 'Physchem', abbrev: 'Physchem', rss_url: 'https://www.mdpi.com/rss/journal/physchem', color: '#fd7e14', category: 'Physical/Theoretical Chemistry' },
  { id: 'mdpi_quantumrep', name: 'Quantum Reports', abbrev: 'Quantum Rep.', rss_url: 'https://www.mdpi.com/rss/journal/quantumrep', color: '#e67e22', category: 'Physical/Theoretical Chemistry' },

  // Inorganic/Materials Chemistry
  { id: 'mdpi_materials', name: 'Materials', abbrev: 'Materials', rss_url: 'https://www.mdpi.com/rss/journal/materials', color: '#7b2d8e', category: 'Inorganic/Materials Chemistry' },
  { id: 'mdpi_nanomaterials', name: 'Nanomaterials', abbrev: 'Nanomaterials', rss_url: 'https://www.mdpi.com/rss/journal/nanomaterials', color: '#6610f2', category: 'Inorganic/Materials Chemistry' },
  { id: 'mdpi_inorganics', name: 'Inorganics', abbrev: 'Inorganics', rss_url: 'https://www.mdpi.com/rss/journal/inorganics', color: '#20c997', category: 'Inorganic/Materials Chemistry' },
  { id: 'mdpi_crystals', name: 'Crystals', abbrev: 'Crystals', rss_url: 'https://www.mdpi.com/rss/journal/crystals', color: '#1abc9c', category: 'Inorganic/Materials Chemistry' },
  { id: 'mdpi_coatings', name: 'Coatings', abbrev: 'Coatings', rss_url: 'https://www.mdpi.com/rss/journal/coatings', color: '#5dade2', category: 'Inorganic/Materials Chemistry' },

  // Organic Chemistry
  { id: 'mdpi_organics', name: 'Organics', abbrev: 'Organics', rss_url: 'https://www.mdpi.com/rss/journal/organics', color: '#d63384', category: 'Organic Chemistry' },
  { id: 'mdpi_reactions', name: 'Reactions', abbrev: 'Reactions', rss_url: 'https://www.mdpi.com/rss/journal/reactions', color: '#dc3545', category: 'Organic Chemistry' },
  { id: 'mdpi_synth', name: 'Synthesis (MDPI)', abbrev: 'Synth. (MDPI)', rss_url: 'https://www.mdpi.com/rss/journal/synthesis', color: '#6f42c1', category: 'Organic Chemistry' },

  // Applied/Industrial Chemistry
  { id: 'mdpi_catalysts', name: 'Catalysts', abbrev: 'Catalysts', rss_url: 'https://www.mdpi.com/rss/journal/catalysts', color: '#28a745', category: 'Applied/Industrial Chemistry' },
  { id: 'mdpi_sustainability', name: 'Sustainability', abbrev: 'Sustainability', rss_url: 'https://www.mdpi.com/rss/journal/sustainability', color: '#2ecc71', category: 'Applied/Industrial Chemistry' },
  { id: 'mdpi_polymers', name: 'Polymers', abbrev: 'Polymers', rss_url: 'https://www.mdpi.com/rss/journal/polymers', color: '#6c757d', category: 'Polymers/Macromolecules' },
  { id: 'mdpi_macromol', name: 'Macromol', abbrev: 'Macromol (MDPI)', rss_url: 'https://www.mdpi.com/rss/journal/macromol', color: '#6f42c1', category: 'Polymers/Macromolecules' },
  { id: 'mdpi_processes', name: 'Processes', abbrev: 'Processes', rss_url: 'https://www.mdpi.com/rss/journal/processes', color: '#ffc107', category: 'Applied/Industrial Chemistry' },
  { id: 'mdpi_foods', name: 'Foods', abbrev: 'Foods', rss_url: 'https://www.mdpi.com/rss/journal/foods', color: '#f1c40f', category: 'Applied/Industrial Chemistry' },
];

export const SPRINGER_JOURNALS = [
  // General
  { id: 'springer_natcatal', name: 'Nature Catalysis', abbrev: 'Nat. Catal.', rss_url: 'https://www.nature.com/natcatal.rss', color: '#0066b3', category: 'General' },
  { id: 'springer_natchem', name: 'Nature Chemistry', abbrev: 'Nat. Chem.', rss_url: 'https://www.nature.com/nchem.rss', color: '#e74c3c', category: 'General' },
  { id: 'springer_natrevmater', name: 'Nature Reviews Materials', abbrev: 'Nat. Rev. Mater.', rss_url: 'https://www.nature.com/natrevmats.rss', color: '#7b2d8e', category: 'General' },
  { id: 'springer_science_adv', name: 'Science Advances (via Nature)', abbrev: 'Sci. Adv.', rss_url: 'https://www.nature.com/natrevchem.rss', color: '#27ae60', category: 'General' },
  { id: 'springer_natrevchem', name: 'Nature Reviews Chemistry', abbrev: 'Nat. Rev. Chem.', rss_url: 'https://www.nature.com/natrevchem.rss', color: '#d63384', category: 'General' },
  { id: 'springer_commchem', name: 'Communications Chemistry', abbrev: 'Commun. Chem.', rss_url: 'https://www.nature.com/commschem.rss', color: '#f39c12', category: 'General' },

  // Analytical Chemistry
  { id: 'springer_microchim', name: 'Microchimica Acta', abbrev: 'Microchim. Acta', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=604', color: '#e85d00', category: 'Analytical Chemistry' },
  { id: 'springer_analbioanal', name: 'Analytical and Bioanalytical Chemistry', abbrev: 'Anal. Bioanal. Chem.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=216', color: '#d35400', category: 'Analytical Chemistry' },

  // Biological/Medicinal Chemistry
  { id: 'springer_jbiolchem', name: 'Journal of Biosciences', abbrev: 'J. Biosci.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=12038', color: '#2980b9', category: 'Biological/Medicinal Chemistry' },
  { id: 'springer_molbiotech', name: 'Molecular Biotechnology', abbrev: 'Mol. Biotechnol.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=12033', color: '#3498db', category: 'Biological/Medicinal Chemistry' },
  { id: 'springer_pharmres', name: 'Pharmaceutical Research', abbrev: 'Pharm. Res.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=11095', color: '#1abc9c', category: 'Biological/Medicinal Chemistry' },

  // Physical/Theoretical Chemistry
  { id: 'springer_theorchemacc', name: 'Theoretical Chemistry Accounts', abbrev: 'Theor. Chem. Acc.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=214', color: '#fd7e14', category: 'Physical/Theoretical Chemistry' },
  { id: 'springer_jmolmodel', name: 'Journal of Molecular Modeling', abbrev: 'J. Mol. Model.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=894', color: '#e67e22', category: 'Physical/Theoretical Chemistry' },
  { id: 'springer_structchem', name: 'Structural Chemistry', abbrev: 'Struct. Chem.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=11224', color: '#f39c12', category: 'Physical/Theoretical Chemistry' },

  // Inorganic/Materials Chemistry
  { id: 'springer_jmater', name: 'Journal of Materials Science', abbrev: 'J. Mater. Sci.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=10853', color: '#20c997', category: 'Inorganic/Materials Chemistry' },
  { id: 'springer_transnano', name: 'Journal of Nanoparticle Research', abbrev: 'J. Nanopart. Res.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=11051', color: '#7b2d8e', category: 'Inorganic/Materials Chemistry' },
  { id: 'springer_natnanotechnol', name: 'Nature Nanotechnology', abbrev: 'Nat. Nanotechnol.', rss_url: 'https://www.nature.com/nnano.rss', color: '#6610f2', category: 'Inorganic/Materials Chemistry' },
  { id: 'springer_natmater', name: 'Nature Materials', abbrev: 'Nat. Mater.', rss_url: 'https://www.nature.com/nmat.rss', color: '#1abc9c', category: 'Inorganic/Materials Chemistry' },

  // Organic Chemistry
  { id: 'springer_synlett', name: 'Synlett', abbrev: 'Synlett', rss_url: 'https://www.thieme-connect.de/media/synlett/rss/latest.rss', color: '#d63384', category: 'Organic Chemistry' },
  { id: 'springer_natsynth', name: 'Nature Synthesis', abbrev: 'Nat. Synth.', rss_url: 'https://www.nature.com/natsynth.rss', color: '#c0392b', category: 'Organic Chemistry' },

  // Applied/Industrial Chemistry
  { id: 'springer_clean', name: 'Clean Technologies and Environmental Policy', abbrev: 'Clean Technol.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=10098', color: '#28a745', category: 'Applied/Industrial Chemistry' },
  { id: 'springer_natenergy', name: 'Nature Energy', abbrev: 'Nat. Energy', rss_url: 'https://www.nature.com/nenergy.rss', color: '#ffc107', category: 'Applied/Industrial Chemistry' },
  // Polymers/Macromolecules
  { id: 'springer_jpolymsci', name: 'Journal of Polymer Science', abbrev: 'J. Polym. Sci.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=10010', color: '#6c757d', category: 'Polymers/Macromolecules' },
  { id: 'springer_polymerbull', name: 'Polymer Bulletin', abbrev: 'Polym. Bull.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=289', color: '#6f42c1', category: 'Polymers/Macromolecules' },
  { id: 'springer_colloidpolymscience', name: 'Colloid and Polymer Science', abbrev: 'Colloid Polym. Sci.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=396', color: '#8e44ad', category: 'Polymers/Macromolecules' },
];

export const TAYLOR_JOURNALS = [
  // General
  { id: 'taylor_molphys', name: 'Molecular Physics', abbrev: 'Mol. Phys.', rss_url: 'https://www.tandfonline.com/feed/rss/tmph20', color: '#0066b3', category: 'General' },
  { id: 'taylor_structurreports', name: 'Acta Crystallographica E', abbrev: 'Acta Crystallogr. E', rss_url: 'https://www.tandfonline.com/feed/rss/gcoo20', color: '#27ae60', category: 'General' },

  // Analytical Chemistry
  { id: 'taylor_analytletter', name: 'Analytical Letters', abbrev: 'Anal. Lett.', rss_url: 'https://www.tandfonline.com/feed/rss/lanl20', color: '#e85d00', category: 'Analytical Chemistry' },
  { id: 'taylor_jliquidchrom', name: 'Journal of Liquid Chromatography & Related Technologies', abbrev: 'J. Liq. Chromatogr.', rss_url: 'https://www.tandfonline.com/feed/rss/lchrom', color: '#d35400', category: 'Analytical Chemistry' },
  { id: 'taylor_applspectrosc', name: 'Applied Spectroscopy Reviews', abbrev: 'Appl. Spectrosc. Rev.', rss_url: 'https://www.tandfonline.com/feed/rss/lasy20', color: '#c0392b', category: 'Analytical Chemistry' },

  // Biological/Medicinal Chemistry
  { id: 'taylor_jenzymeinhibmed', name: 'Journal of Enzyme Inhibition and Medicinal Chemistry', abbrev: 'J. Enzyme Inhib. Med. Chem.', rss_url: 'https://www.tandfonline.com/feed/rss/ienz20', color: '#2980b9', category: 'Biological/Medicinal Chemistry' },
  { id: 'taylor_drugdevind', name: 'Drug Development and Industrial Pharmacy', abbrev: 'Drug Dev. Ind. Pharm.', rss_url: 'https://www.tandfonline.com/feed/rss/iddi20', color: '#3498db', category: 'Biological/Medicinal Chemistry' },
  { id: 'taylor_jrecept', name: 'Journal of Receptors and Signal Transduction', abbrev: 'J. Recept. Signal Transduct.', rss_url: 'https://www.tandfonline.com/feed/rss/lrst20', color: '#1abc9c', category: 'Biological/Medicinal Chemistry' },
  { id: 'taylor_pharmdevel', name: 'Pharmaceutical Development and Technology', abbrev: 'Pharm. Dev. Technol.', rss_url: 'https://www.tandfonline.com/feed/rss/ipdt20', color: '#8e44ad', category: 'Biological/Medicinal Chemistry' },

  // Physical/Theoretical Chemistry
  { id: 'taylor_jchemsocpak', name: 'Journal of Coordination Chemistry', abbrev: 'J. Coord. Chem.', rss_url: 'https://www.tandfonline.com/feed/rss/gcoo20', color: '#fd7e14', category: 'Physical/Theoretical Chemistry' },
  { id: 'taylor_intjchemkinet', name: 'International Journal of Chemical Kinetics', abbrev: 'Int. J. Chem. Kinet.', rss_url: 'https://www.tandfonline.com/feed/rss/kin', color: '#e67e22', category: 'Physical/Theoretical Chemistry' },

  // Inorganic/Materials Chemistry
  { id: 'taylor_phasettrans', name: 'Phase Transitions', abbrev: 'Phase Transit.', rss_url: 'https://www.tandfonline.com/feed/rss/gpht20', color: '#20c997', category: 'Inorganic/Materials Chemistry' },
  { id: 'taylor_jdispsci', name: 'Journal of Dispersion Science and Technology', abbrev: 'J. Dispers. Sci. Technol.', rss_url: 'https://www.tandfonline.com/feed/rss/ldis20', color: '#7b2d8e', category: 'Inorganic/Materials Chemistry' },
  { id: 'taylor_matletters', name: 'Materials Letters: X', abbrev: 'Mater. Lett. X', rss_url: 'https://www.tandfonline.com/feed/rss/ymlt20', color: '#1abc9c', category: 'Inorganic/Materials Chemistry' },

  // Organic Chemistry
  { id: 'taylor_synthcomm', name: 'Synthetic Communications', abbrev: 'Synth. Commun.', rss_url: 'https://www.tandfonline.com/feed/rss/lsyc20', color: '#d63384', category: 'Organic Chemistry' },
  { id: 'taylor_natprod', name: 'Natural Product Research', abbrev: 'Nat. Prod. Res.', rss_url: 'https://www.tandfonline.com/feed/rss/gnpl20', color: '#c0392b', category: 'Organic Chemistry' },
  { id: 'taylor_jsulfur', name: 'Phosphorus, Sulfur, and Silicon', abbrev: 'Phosphorus Sulfur Silicon', rss_url: 'https://www.tandfonline.com/feed/rss/gpss20', color: '#6f42c1', category: 'Organic Chemistry' },

  // Applied/Industrial Chemistry
  { id: 'taylor_chemengcomm', name: 'Chemical Engineering Communications', abbrev: 'Chem. Eng. Commun.', rss_url: 'https://www.tandfonline.com/feed/rss/gcec20', color: '#6c757d', category: 'Applied/Industrial Chemistry' },
  { id: 'taylor_jenvsciheal', name: 'Journal of Environmental Science and Health', abbrev: 'J. Environ. Sci. Health', rss_url: 'https://www.tandfonline.com/feed/rss/lesa20', color: '#28a745', category: 'Applied/Industrial Chemistry' },
  // Polymers/Macromolecules
  { id: 'taylor_polymer', name: 'Polymer Reviews', abbrev: 'Polym. Rev.', rss_url: 'https://www.tandfonline.com/feed/rss/lmsc20', color: '#ffc107', category: 'Polymers/Macromolecules' },
  { id: 'taylor_jmacromolscib', name: 'Journal of Macromolecular Science, Part B', abbrev: 'J. Macromol. Sci. B', rss_url: 'https://www.tandfonline.com/feed/rss/lmsb20', color: '#6f42c1', category: 'Polymers/Macromolecules' },
  { id: 'taylor_jmacromolscia', name: 'Journal of Macromolecular Science, Part A', abbrev: 'J. Macromol. Sci. A', rss_url: 'https://www.tandfonline.com/feed/rss/lmsa20', color: '#8e44ad', category: 'Polymers/Macromolecules' },
];

export const AAAS_JOURNALS = [
  // General
  { id: 'aaas_science', name: 'Science', abbrev: 'Science', rss_url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science', color: '#c0392b', category: 'General' },
  { id: 'aaas_sciadv', name: 'Science Advances', abbrev: 'Sci. Adv.', rss_url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=sciadv', color: '#e74c3c', category: 'General' },
  { id: 'aaas_scisignal', name: 'Science Signaling', abbrev: 'Sci. Signal.', rss_url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=scisignal', color: '#d63384', category: 'General' },
  { id: 'aaas_sciimmunol', name: 'Science Immunology', abbrev: 'Sci. Immunol.', rss_url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=sciimmunol', color: '#6f42c1', category: 'General' },
  { id: 'aaas_scirobot', name: 'Science Robotics', abbrev: 'Sci. Robot.', rss_url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=scirobotics', color: '#0066b3', category: 'General' },

  // Biological/Medicinal Chemistry
  { id: 'aaas_scitranslmed', name: 'Science Translational Medicine', abbrev: 'Sci. Transl. Med.', rss_url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=stm', color: '#2980b9', category: 'Biological/Medicinal Chemistry' },

  // Physical/Theoretical Chemistry
  { id: 'aaas_scienceabc', name: 'Science (Physics & Chemistry subset)', abbrev: 'Science (Phys/Chem)', rss_url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science', color: '#fd7e14', category: 'Physical/Theoretical Chemistry' },

  // Inorganic/Materials Chemistry
  { id: 'aaas_sciadv_mater', name: 'Science Advances (Materials)', abbrev: 'Sci. Adv. (Mater.)', rss_url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=sciadv', color: '#20c997', category: 'Inorganic/Materials Chemistry' },

  // Applied/Industrial Chemistry
  { id: 'aaas_scienceaas', name: 'Science (Energy & Environment)', abbrev: 'Science (Energy)', rss_url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science', color: '#28a745', category: 'Applied/Industrial Chemistry' },
];

export const OTHER_JOURNALS = [];

// ─── Materials, Analytics & Sustainability ───────────────────────────────────

export const MATERIALS_CATEGORIES = [
  'Materials Science & Nanotechnology',
  'Analytical & Measurement Science',
  'Sustainability & Green Chemistry',
  'Sensors & Diagnostics',
  'Polymers & Soft Matter',
];


export const ACS_MATERIALS_JOURNALS = [
  // Materials Science & Nanotechnology
  { id: 'mat_acs_acsnano', name: 'ACS Nano', abbrev: 'ACS Nano', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ancac3', color: '#7b2d8e', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_acs_nanolett', name: 'Nano Letters', abbrev: 'Nano Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=nalefd', color: '#6610f2', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_acs_acsami', name: 'ACS Applied Materials & Interfaces', abbrev: 'ACS AMI', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aamick', color: '#00875a', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_acs_chemmater', name: 'Chemistry of Materials', abbrev: 'Chem. Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=cmatex', color: '#16a085', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_acs_acsnanomaterials', name: 'ACS Applied Nano Materials', abbrev: 'ACS Appl. Nano Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aanmf6', color: '#5dade2', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_acs_acsapplenergymat', name: 'ACS Applied Energy Materials', abbrev: 'ACS Appl. Energy Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaemcq', color: '#ffc107', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_acs_acsapplelectrmat', name: 'ACS Applied Electronic Materials', abbrev: 'ACS Appl. Electron. Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaembp', color: '#6610f2', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_acs_acsapploptmat', name: 'ACS Applied Optical Materials', abbrev: 'ACS Appl. Opt. Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaoma6', color: '#0066b3', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_acs_acsmaterlett', name: 'ACS Materials Letters', abbrev: 'ACS Mater. Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amlcef', color: '#2e86c1', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_acs_langmuir', name: 'Langmuir', abbrev: 'Langmuir', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=langd5', color: '#17a2b8', category: 'Materials Science & Nanotechnology' },
  // Analytical & Measurement Science
  { id: 'mat_acs_analchem', name: 'Analytical Chemistry', abbrev: 'Anal. Chem.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ancham', color: '#e85d00', category: 'Analytical & Measurement Science' },
  { id: 'mat_acs_acssensors', name: 'ACS Sensors', abbrev: 'ACS Sens.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ascefj', color: '#ff6b35', category: 'Analytical & Measurement Science' },
  { id: 'mat_acs_acsmeasursciau', name: 'ACS Measurement Science Au', abbrev: 'ACS Meas. Sci. Au', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amachv', color: '#d35400', category: 'Analytical & Measurement Science' },
  { id: 'mat_acs_jproteomeres', name: 'Journal of Proteome Research', abbrev: 'J. Proteome Res.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jprobs', color: '#c0392b', category: 'Analytical & Measurement Science' },
  // Sustainability & Green Chemistry
  { id: 'mat_acs_acssustainchem', name: 'ACS Sustainable Chemistry & Engineering', abbrev: 'ACS Sustain. Chem. Eng.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ascecg', color: '#2ecc71', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_acs_envscitechnol', name: 'Environmental Science & Technology', abbrev: 'Environ. Sci. Technol.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=esthag', color: '#28a745', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_acs_acsenergylett', name: 'ACS Energy Letters', abbrev: 'ACS Energy Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aelccp', color: '#ffc107', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_acs_acssustresourcau', name: 'ACS Sustainable Resource Management', abbrev: 'ACS Sustain. Resour. Manag.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=asrmcm', color: '#2ecc71', category: 'Sustainability & Green Chemistry' },
  // Sensors & Diagnostics
  { id: 'mat_acs_acsbiomater', name: 'ACS Biomaterials Science & Engineering', abbrev: 'ACS Biomater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=abseba', color: '#16a085', category: 'Sensors & Diagnostics' },
  { id: 'mat_acs_acsapplbiomat', name: 'ACS Applied Bio Materials', abbrev: 'ACS Appl. Bio Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aabmcb', color: '#1abc9c', category: 'Sensors & Diagnostics' },
  // Polymers & Soft Matter
  { id: 'mat_acs_macromolecules', name: 'Macromolecules', abbrev: 'Macromolecules', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=mamobx', color: '#e91e8c', category: 'Polymers & Soft Matter' },
  { id: 'mat_acs_acsapplpolym', name: 'ACS Applied Polymer Materials', abbrev: 'ACS Appl. Polym. Mater.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aapmcd', color: '#495057', category: 'Polymers & Soft Matter' },
  { id: 'mat_acs_acsmacrolett', name: 'ACS Macro Letters', abbrev: 'ACS Macro Lett.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amlccd', color: '#6f42c1', category: 'Polymers & Soft Matter' },
];

export const RSC_MATERIALS_JOURNALS = [
  // Materials Science & Nanotechnology
  { id: 'mat_rsc_nanoscale', name: 'Nanoscale', abbrev: 'Nanoscale', rss_url: 'https://pubs.rsc.org/rss/nr', color: '#7b2d8e', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_rsc_nanoscaleadv', name: 'Nanoscale Advances', abbrev: 'Nanoscale Adv.', rss_url: 'https://pubs.rsc.org/rss/na', color: '#6c3483', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_rsc_nanoscalehoriz', name: 'Nanoscale Horizons', abbrev: 'Nanoscale Horiz.', rss_url: 'https://pubs.rsc.org/rss/nh', color: '#5b2d8e', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_rsc_jmaterchema', name: 'Journal of Materials Chemistry A', abbrev: 'J. Mater. Chem. A', rss_url: 'https://pubs.rsc.org/rss/ta', color: '#117a65', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_rsc_jmaterchemb', name: 'Journal of Materials Chemistry B', abbrev: 'J. Mater. Chem. B', rss_url: 'https://pubs.rsc.org/rss/tb', color: '#1a5276', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_rsc_jmaterchemc', name: 'Journal of Materials Chemistry C', abbrev: 'J. Mater. Chem. C', rss_url: 'https://pubs.rsc.org/rss/tc', color: '#2e86c1', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_rsc_materadv', name: 'Materials Advances', abbrev: 'Mater. Adv.', rss_url: 'https://pubs.rsc.org/rss/ma', color: '#0d6efd', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_rsc_materhorizons', name: 'Materials Horizons', abbrev: 'Mater. Horiz.', rss_url: 'https://pubs.rsc.org/rss/mh', color: '#005f73', category: 'Materials Science & Nanotechnology' },
  // Analytical & Measurement Science
  { id: 'mat_rsc_analyst', name: 'Analyst', abbrev: 'Analyst', rss_url: 'https://pubs.rsc.org/rss/an', color: '#e85d00', category: 'Analytical & Measurement Science' },
  { id: 'mat_rsc_analytmethods', name: 'Analytical Methods', abbrev: 'Anal. Methods', rss_url: 'https://pubs.rsc.org/rss/ay', color: '#d35400', category: 'Analytical & Measurement Science' },
  { id: 'mat_rsc_jaas', name: 'Journal of Analytical Atomic Spectrometry', abbrev: 'JAAS', rss_url: 'https://pubs.rsc.org/rss/ja', color: '#c0392b', category: 'Analytical & Measurement Science' },
  { id: 'mat_rsc_labchip', name: 'Lab on a Chip', abbrev: 'Lab Chip', rss_url: 'https://pubs.rsc.org/rss/lc', color: '#e74c3c', category: 'Analytical & Measurement Science' },
  { id: 'mat_rsc_sensact', name: 'Sensors & Diagnostics', abbrev: 'Sens. Diagn.', rss_url: 'https://pubs.rsc.org/rss/sd', color: '#f39c12', category: 'Sensors & Diagnostics' },
  // Sustainability & Green Chemistry
  { id: 'mat_rsc_greenchem', name: 'Green Chemistry', abbrev: 'Green Chem.', rss_url: 'https://pubs.rsc.org/rss/gc', color: '#27ae60', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_rsc_energyenviron', name: 'Energy & Environmental Science', abbrev: 'Energy Environ. Sci.', rss_url: 'https://pubs.rsc.org/rss/ee', color: '#28a745', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_rsc_sustenergy', name: 'Sustainable Energy & Fuels', abbrev: 'Sustain. Energy Fuels', rss_url: 'https://pubs.rsc.org/rss/se', color: '#2ecc71', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_rsc_rscsustain', name: 'RSC Sustainability', abbrev: 'RSC Sustain.', rss_url: 'https://pubs.rsc.org/rss/su', color: '#2ecc71', category: 'Sustainability & Green Chemistry' },
  // Polymers & Soft Matter
  { id: 'mat_rsc_polym', name: 'Polymer Chemistry', abbrev: 'Polym. Chem.', rss_url: 'https://pubs.rsc.org/rss/py', color: '#6f42c1', category: 'Polymers & Soft Matter' },
  { id: 'mat_rsc_softmatter', name: 'Soft Matter', abbrev: 'Soft Matter', rss_url: 'https://pubs.rsc.org/rss/sm', color: '#8e44ad', category: 'Polymers & Soft Matter' },
];

export const WILEY_MATERIALS_JOURNALS = [
  // Materials Science & Nanotechnology
  { id: 'mat_wiley_advmat', name: 'Advanced Materials', abbrev: 'Adv. Mater.', rss_url: 'https://onlinelibrary.wiley.com/feed/15214095/most-recent', color: '#7b2d8e', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_wiley_advfuncmat', name: 'Advanced Functional Materials', abbrev: 'Adv. Funct. Mater.', rss_url: 'https://onlinelibrary.wiley.com/feed/16163028/most-recent', color: '#6610f2', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_wiley_small', name: 'Small', abbrev: 'Small', rss_url: 'https://onlinelibrary.wiley.com/feed/16136829/most-recent', color: '#1abc9c', category: 'Materials Science & Nanotechnology' },
  // Analytical & Measurement Science
  { id: 'mat_wiley_jms', name: 'Journal of Mass Spectrometry', abbrev: 'J. Mass Spectrom.', rss_url: 'https://onlinelibrary.wiley.com/feed/10969888/most-recent', color: '#c0392b', category: 'Analytical & Measurement Science' },
  { id: 'mat_wiley_electrophoresis', name: 'Electrophoresis', abbrev: 'Electrophoresis', rss_url: 'https://onlinelibrary.wiley.com/feed/15222683/most-recent', color: '#d35400', category: 'Analytical & Measurement Science' },
  // Sustainability & Green Chemistry
  { id: 'mat_wiley_chemsuschem', name: 'ChemSusChem', abbrev: 'ChemSusChem', rss_url: 'https://onlinelibrary.wiley.com/feed/18645631/most-recent', color: '#2ecc71', category: 'Sustainability & Green Chemistry' },
  // Polymers & Soft Matter
  { id: 'mat_wiley_macromolchem', name: 'Macromolecular Chemistry and Physics', abbrev: 'Macromol. Chem. Phys.', rss_url: 'https://onlinelibrary.wiley.com/feed/15213935/most-recent', color: '#6f42c1', category: 'Polymers & Soft Matter' },
  { id: 'mat_wiley_macromolrapid', name: 'Macromolecular Rapid Communications', abbrev: 'Macromol. Rapid Commun.', rss_url: 'https://onlinelibrary.wiley.com/feed/15213927/most-recent', color: '#8e44ad', category: 'Polymers & Soft Matter' },
  { id: 'mat_wiley_jpolymscib', name: 'Journal of Polymer Science', abbrev: 'J. Polym. Sci.', rss_url: 'https://onlinelibrary.wiley.com/feed/26429071/most-recent', color: '#6c757d', category: 'Polymers & Soft Matter' },
];

export const ELSEVIER_MATERIALS_JOURNALS = [
  // Materials Science & Nanotechnology
  { id: 'mat_elsevier_jalloy', name: 'Journal of Alloys and Compounds', abbrev: 'J. Alloys Compd.', rss_url: 'https://rss.sciencedirect.com/publication/science/09258388', color: '#20c997', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_elsevier_carbon', name: 'Carbon', abbrev: 'Carbon', rss_url: 'https://rss.sciencedirect.com/publication/science/00086223', color: '#495057', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_elsevier_matchemphys', name: 'Materials Chemistry and Physics', abbrev: 'Mater. Chem. Phys.', rss_url: 'https://rss.sciencedirect.com/publication/science/02540584', color: '#6610f2', category: 'Materials Science & Nanotechnology' },
  // Analytical & Measurement Science
  { id: 'mat_elsevier_talanta', name: 'Talanta', abbrev: 'Talanta', rss_url: 'https://rss.sciencedirect.com/publication/science/00399140', color: '#e85d00', category: 'Analytical & Measurement Science' },
  { id: 'mat_elsevier_analytica', name: 'Analytica Chimica Acta', abbrev: 'Anal. Chim. Acta', rss_url: 'https://rss.sciencedirect.com/publication/science/00032670', color: '#d35400', category: 'Analytical & Measurement Science' },
  { id: 'mat_elsevier_spectrochim', name: 'Spectrochimica Acta Part A', abbrev: 'Spectrochim. Acta A', rss_url: 'https://rss.sciencedirect.com/publication/science/13861425', color: '#f39c12', category: 'Analytical & Measurement Science' },
  { id: 'mat_elsevier_microchemj', name: 'Microchemical Journal', abbrev: 'Microchem. J.', rss_url: 'https://rss.sciencedirect.com/publication/science/0026265X', color: '#e67e22', category: 'Analytical & Measurement Science' },
  { id: 'mat_elsevier_jchromatA', name: 'Journal of Chromatography A', abbrev: 'J. Chromatogr. A', rss_url: 'https://rss.sciencedirect.com/publication/science/00219673', color: '#c0392b', category: 'Analytical & Measurement Science' },
  // Sustainability & Green Chemistry
  { id: 'mat_elsevier_jhazmater', name: 'Journal of Hazardous Materials', abbrev: 'J. Hazard. Mater.', rss_url: 'https://rss.sciencedirect.com/publication/science/03043894', color: '#e74c3c', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_elsevier_applenergy', name: 'Applied Energy', abbrev: 'Appl. Energy', rss_url: 'https://rss.sciencedirect.com/publication/science/03062619', color: '#28a745', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_elsevier_fuel', name: 'Fuel', abbrev: 'Fuel', rss_url: 'https://rss.sciencedirect.com/publication/science/00162361', color: '#ffc107', category: 'Sustainability & Green Chemistry' },
  // Polymers & Soft Matter
  { id: 'mat_elsevier_polymer', name: 'Polymer', abbrev: 'Polymer', rss_url: 'https://rss.sciencedirect.com/publication/science/00323861', color: '#6c757d', category: 'Polymers & Soft Matter' },
  { id: 'mat_elsevier_eurpolymj', name: 'European Polymer Journal', abbrev: 'Eur. Polym. J.', rss_url: 'https://rss.sciencedirect.com/publication/science/00143057', color: '#6f42c1', category: 'Polymers & Soft Matter' },
];

export const MDPI_MATERIALS_JOURNALS = [
  // Materials Science & Nanotechnology
  { id: 'mat_mdpi_materials', name: 'Materials', abbrev: 'Materials', rss_url: 'https://www.mdpi.com/rss/journal/materials', color: '#7b2d8e', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_mdpi_nanomaterials', name: 'Nanomaterials', abbrev: 'Nanomaterials', rss_url: 'https://www.mdpi.com/rss/journal/nanomaterials', color: '#6610f2', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_mdpi_coatings', name: 'Coatings', abbrev: 'Coatings', rss_url: 'https://www.mdpi.com/rss/journal/coatings', color: '#5dade2', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_mdpi_crystals', name: 'Crystals', abbrev: 'Crystals', rss_url: 'https://www.mdpi.com/rss/journal/crystals', color: '#1abc9c', category: 'Materials Science & Nanotechnology' },
  // Analytical & Measurement Science
  { id: 'mat_mdpi_chemosensors', name: 'Chemosensors', abbrev: 'Chemosensors', rss_url: 'https://www.mdpi.com/rss/journal/chemosensors', color: '#e85d00', category: 'Analytical & Measurement Science' },
  { id: 'mat_mdpi_sensors', name: 'Sensors', abbrev: 'Sensors', rss_url: 'https://www.mdpi.com/rss/journal/sensors', color: '#e74c3c', category: 'Analytical & Measurement Science' },
  { id: 'mat_mdpi_analytica', name: 'Analytica', abbrev: 'Analytica', rss_url: 'https://www.mdpi.com/rss/journal/analytica', color: '#d35400', category: 'Analytical & Measurement Science' },
  // Sustainability & Green Chemistry
  { id: 'mat_mdpi_sustainability', name: 'Sustainability', abbrev: 'Sustainability', rss_url: 'https://www.mdpi.com/rss/journal/sustainability', color: '#2ecc71', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_mdpi_catalysts', name: 'Catalysts', abbrev: 'Catalysts', rss_url: 'https://www.mdpi.com/rss/journal/catalysts', color: '#28a745', category: 'Sustainability & Green Chemistry' },
  // Polymers & Soft Matter
  { id: 'mat_mdpi_polymers', name: 'Polymers', abbrev: 'Polymers', rss_url: 'https://www.mdpi.com/rss/journal/polymers', color: '#6c757d', category: 'Polymers & Soft Matter' },
  { id: 'mat_mdpi_macromol', name: 'Macromol', abbrev: 'Macromol (MDPI)', rss_url: 'https://www.mdpi.com/rss/journal/macromol', color: '#6f42c1', category: 'Polymers & Soft Matter' },
];

export const SPRINGER_MATERIALS_JOURNALS = [
  // Materials Science & Nanotechnology
  { id: 'mat_springer_jmater', name: 'Journal of Materials Science', abbrev: 'J. Mater. Sci.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=10853', color: '#20c997', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_springer_transnano', name: 'Journal of Nanoparticle Research', abbrev: 'J. Nanopart. Res.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=11051', color: '#7b2d8e', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_springer_natnanotechnol', name: 'Nature Nanotechnology', abbrev: 'Nat. Nanotechnol.', rss_url: 'https://www.nature.com/nnano.rss', color: '#6610f2', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_springer_natmater', name: 'Nature Materials', abbrev: 'Nat. Mater.', rss_url: 'https://www.nature.com/nmat.rss', color: '#1abc9c', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_springer_natrevmater', name: 'Nature Reviews Materials', abbrev: 'Nat. Rev. Mater.', rss_url: 'https://www.nature.com/natrevmats.rss', color: '#7b2d8e', category: 'Materials Science & Nanotechnology' },
  // Analytical & Measurement Science
  { id: 'mat_springer_microchim', name: 'Microchimica Acta', abbrev: 'Microchim. Acta', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=604', color: '#e85d00', category: 'Analytical & Measurement Science' },
  { id: 'mat_springer_analbioanal', name: 'Analytical and Bioanalytical Chemistry', abbrev: 'Anal. Bioanal. Chem.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=216', color: '#d35400', category: 'Analytical & Measurement Science' },
  // Sustainability & Green Chemistry
  { id: 'mat_springer_natenergy', name: 'Nature Energy', abbrev: 'Nat. Energy', rss_url: 'https://www.nature.com/nenergy.rss', color: '#ffc107', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_springer_clean', name: 'Clean Technologies and Environmental Policy', abbrev: 'Clean Technol.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=10098', color: '#28a745', category: 'Sustainability & Green Chemistry' },
  // Polymers & Soft Matter
  { id: 'mat_springer_jpolymsci', name: 'Journal of Polymer Science', abbrev: 'J. Polym. Sci.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=10010', color: '#6c757d', category: 'Polymers & Soft Matter' },
  { id: 'mat_springer_polymerbull', name: 'Polymer Bulletin', abbrev: 'Polym. Bull.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=289', color: '#6f42c1', category: 'Polymers & Soft Matter' },
];

export const ENGINEERING_CATEGORIES = [
  'Chemical Engineering',
  'Reaction Engineering',
  'Separations',
  'Process Modeling & Simulation',
  'Scale-up & Manufacturing Science',
];

export const ELSEVIER_ENGINEERING_JOURNALS = [
  // Chemical Engineering
  { id: 'eng_elsevier_chemengsci', name: 'Chemical Engineering Science', abbrev: 'Chem. Eng. Sci.', rss_url: 'https://rss.sciencedirect.com/publication/science/00092509', color: '#ff6c00', category: 'Chemical Engineering' },
  { id: 'eng_elsevier_chemengj', name: 'Chemical Engineering Journal', abbrev: 'Chem. Eng. J.', rss_url: 'https://rss.sciencedirect.com/publication/science/13858947', color: '#ff6c00', category: 'Chemical Engineering' },
  { id: 'eng_elsevier_aiche', name: 'Chemical Engineering Research and Design', abbrev: 'Chem. Eng. Res. Des.', rss_url: 'https://rss.sciencedirect.com/publication/science/02638762', color: '#ff6c00', category: 'Chemical Engineering' },
  { id: 'eng_elsevier_chemengscicomm', name: 'Chemical Engineering Communications', abbrev: 'Chem. Eng. Commun.', rss_url: 'https://rss.sciencedirect.com/publication/science/00986445', color: '#ff6c00', category: 'Chemical Engineering' },
  { id: 'eng_elsevier_proceng', name: 'Procedia Engineering', abbrev: 'Procedia Eng.', rss_url: 'https://rss.sciencedirect.com/publication/science/18777058', color: '#ff6c00', category: 'Chemical Engineering' },
  // Reaction Engineering
  { id: 'eng_elsevier_cattoday', name: 'Catalysis Today', abbrev: 'Catal. Today', rss_url: 'https://rss.sciencedirect.com/publication/science/09205861', color: '#ff6c00', category: 'Reaction Engineering' },
  { id: 'eng_elsevier_chemengprocess', name: 'Chemical Engineering and Processing', abbrev: 'Chem. Eng. Process.', rss_url: 'https://rss.sciencedirect.com/publication/science/02552701', color: '#ff6c00', category: 'Reaction Engineering' },
  { id: 'eng_elsevier_reactkineticsmechcat', name: 'Reaction Kinetics, Mechanisms and Catalysis', abbrev: 'React. Kinet. Mech. Catal.', rss_url: 'https://rss.sciencedirect.com/publication/science/18785190', color: '#ff6c00', category: 'Reaction Engineering' },
  // Separations
  { id: 'eng_elsevier_seppur', name: 'Separation and Purification Technology', abbrev: 'Sep. Purif. Technol.', rss_url: 'https://rss.sciencedirect.com/publication/science/13835866', color: '#ff6c00', category: 'Separations' },
  { id: 'eng_elsevier_fluidphaseequilib', name: 'Fluid Phase Equilibria', abbrev: 'Fluid Phase Equilib.', rss_url: 'https://rss.sciencedirect.com/publication/science/03783812', color: '#ff6c00', category: 'Separations' },
  { id: 'eng_elsevier_jmembrsci', name: 'Journal of Membrane Science', abbrev: 'J. Membr. Sci.', rss_url: 'https://rss.sciencedirect.com/publication/science/03767388', color: '#ff6c00', category: 'Separations' },
  { id: 'eng_elsevier_jchromatagrap', name: 'Journal of Chromatography A', abbrev: 'J. Chromatogr. A', rss_url: 'https://rss.sciencedirect.com/publication/science/00219673', color: '#ff6c00', category: 'Separations' },
  // Process Modeling & Simulation
  { id: 'eng_elsevier_compchemeng', name: 'Computers & Chemical Engineering', abbrev: 'Comput. Chem. Eng.', rss_url: 'https://rss.sciencedirect.com/publication/science/00981354', color: '#ff6c00', category: 'Process Modeling & Simulation' },
  { id: 'eng_elsevier_chemengjour_b', name: 'Chemical Engineering & Technology', abbrev: 'Chem. Eng. Technol.', rss_url: 'https://rss.sciencedirect.com/publication/science/09307516', color: '#ff6c00', category: 'Process Modeling & Simulation' },
  // Scale-up & Manufacturing Science
  { id: 'eng_elsevier_intjpharm', name: 'International Journal of Pharmaceutics', abbrev: 'Int. J. Pharm.', rss_url: 'https://rss.sciencedirect.com/publication/science/03785173', color: '#ff6c00', category: 'Scale-up & Manufacturing Science' },
  { id: 'eng_elsevier_orgprocess', name: 'Organic Process Research & Development (Elsevier)', abbrev: 'Org. Process Res. Dev.', rss_url: 'https://rss.sciencedirect.com/publication/science/10836160', color: '#ff6c00', category: 'Scale-up & Manufacturing Science' },
];

export const WILEY_ENGINEERING_JOURNALS = [
  // Chemical Engineering
  { id: 'eng_wiley_aiche', name: 'AIChE Journal', abbrev: 'AIChE J.', rss_url: 'https://onlinelibrary.wiley.com/feed/15475905/most-recent', color: '#d63384', category: 'Chemical Engineering' },
  { id: 'eng_wiley_chemeng', name: 'Chemical Engineering & Technology', abbrev: 'Chem. Eng. Technol.', rss_url: 'https://onlinelibrary.wiley.com/feed/15214125/most-recent', color: '#d63384', category: 'Chemical Engineering' },
  { id: 'eng_wiley_canchemeng', name: 'Canadian Journal of Chemical Engineering', abbrev: 'Can. J. Chem. Eng.', rss_url: 'https://onlinelibrary.wiley.com/feed/1939019x/most-recent', color: '#d63384', category: 'Chemical Engineering' },
  // Reaction Engineering
  { id: 'eng_wiley_intjchemkinet', name: 'International Journal of Chemical Kinetics', abbrev: 'Int. J. Chem. Kinet.', rss_url: 'https://onlinelibrary.wiley.com/feed/10974601/most-recent', color: '#d63384', category: 'Reaction Engineering' },
  { id: 'eng_wiley_chemcat', name: 'ChemCatChem', abbrev: 'ChemCatChem', rss_url: 'https://onlinelibrary.wiley.com/feed/18673899/most-recent', color: '#d63384', category: 'Reaction Engineering' },
  // Separations
  { id: 'eng_wiley_jsepsci', name: 'Journal of Separation Science', abbrev: 'J. Sep. Sci.', rss_url: 'https://onlinelibrary.wiley.com/feed/16159314/most-recent', color: '#d63384', category: 'Separations' },
  { id: 'eng_wiley_electrophoresis', name: 'Electrophoresis', abbrev: 'Electrophoresis', rss_url: 'https://onlinelibrary.wiley.com/feed/15222683/most-recent', color: '#d63384', category: 'Separations' },
  // Process Modeling & Simulation
  { id: 'eng_wiley_jchemtechnolbiotechnol', name: 'Journal of Chemical Technology & Biotechnology', abbrev: 'J. Chem. Technol. Biotechnol.', rss_url: 'https://onlinelibrary.wiley.com/feed/10974660/most-recent', color: '#d63384', category: 'Process Modeling & Simulation' },
  // Scale-up & Manufacturing Science
  { id: 'eng_wiley_jpharmscience', name: 'Journal of Pharmaceutical Sciences', abbrev: 'J. Pharm. Sci.', rss_url: 'https://onlinelibrary.wiley.com/feed/15206017/most-recent', color: '#d63384', category: 'Scale-up & Manufacturing Science' },
];

export const ACS_ENGINEERING_JOURNALS = [
  // Chemical Engineering
  { id: 'eng_acs_iecr', name: 'Industrial & Engineering Chemistry Research', abbrev: 'Ind. Eng. Chem. Res.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=iecred', color: '#0066b3', category: 'Chemical Engineering' },
  { id: 'eng_acs_acseng', name: 'ACS Engineering Au', abbrev: 'ACS Eng. Au', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aeacb3', color: '#0066b3', category: 'Chemical Engineering' },
  // Reaction Engineering
  { id: 'eng_acs_acscatal', name: 'ACS Catalysis', abbrev: 'ACS Catal.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=accacs', color: '#0066b3', category: 'Reaction Engineering' },
  { id: 'eng_acs_orgprocess', name: 'Organic Process Research & Development', abbrev: 'Org. Process Res. Dev.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=oprdfk', color: '#0066b3', category: 'Reaction Engineering' },
  // Separations
  { id: 'eng_acs_langmuireng', name: 'Langmuir', abbrev: 'Langmuir', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=langd5', color: '#0066b3', category: 'Separations' },
  { id: 'eng_acs_envscitechnol', name: 'Environmental Science & Technology', abbrev: 'Environ. Sci. Technol.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=esthag', color: '#0066b3', category: 'Separations' },
  // Process Modeling & Simulation
  { id: 'eng_acs_jctc', name: 'Journal of Chemical Theory and Computation', abbrev: 'J. Chem. Theory Comput.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jctcce', color: '#0066b3', category: 'Process Modeling & Simulation' },
  // Scale-up & Manufacturing Science
  { id: 'eng_acs_molpharm', name: 'Molecular Pharmaceutics', abbrev: 'Mol. Pharm.', rss_url: 'https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=mpohbp', color: '#0066b3', category: 'Scale-up & Manufacturing Science' },
];

export const RSC_ENGINEERING_JOURNALS = [
  // Chemical Engineering
  { id: 'eng_rsc_reactchemeng', name: 'Reaction Chemistry & Engineering', abbrev: 'React. Chem. Eng.', rss_url: 'https://pubs.rsc.org/rss/re', color: '#e63946', category: 'Chemical Engineering' },
  { id: 'eng_rsc_indchemmat', name: 'Industrial Chemistry & Materials', abbrev: 'Ind. Chem. Mater.', rss_url: 'https://pubs.rsc.org/rss/im', color: '#e63946', category: 'Chemical Engineering' },
  // Reaction Engineering
  { id: 'eng_rsc_catalscitechnol', name: 'Catalysis Science & Technology', abbrev: 'Catal. Sci. Technol.', rss_url: 'https://pubs.rsc.org/rss/cy', color: '#e63946', category: 'Reaction Engineering' },
  { id: 'eng_rsc_greenchem', name: 'Green Chemistry', abbrev: 'Green Chem.', rss_url: 'https://pubs.rsc.org/rss/gc', color: '#e63946', category: 'Reaction Engineering' },
  // Separations
  { id: 'eng_rsc_labchip', name: 'Lab on a Chip', abbrev: 'Lab Chip', rss_url: 'https://pubs.rsc.org/rss/lc', color: '#e63946', category: 'Separations' },
  { id: 'eng_rsc_envsciwat', name: 'Environmental Science: Water Research & Technology', abbrev: 'Environ. Sci.: Water', rss_url: 'https://pubs.rsc.org/rss/ew', color: '#e63946', category: 'Separations' },
  // Process Modeling & Simulation
  { id: 'eng_rsc_molsysdes', name: 'Molecular Systems Design & Engineering', abbrev: 'Mol. Syst. Des. Eng.', rss_url: 'https://pubs.rsc.org/rss/me', color: '#e63946', category: 'Process Modeling & Simulation' },
  { id: 'eng_rsc_digidisc', name: 'Digital Discovery', abbrev: 'Digital Discovery', rss_url: 'https://pubs.rsc.org/rss/dd', color: '#e63946', category: 'Process Modeling & Simulation' },
  // Scale-up & Manufacturing Science
  { id: 'eng_rsc_rscadv', name: 'RSC Advances', abbrev: 'RSC Adv.', rss_url: 'https://pubs.rsc.org/rss/ra', color: '#e63946', category: 'Scale-up & Manufacturing Science' },
];

export const SPRINGER_ENGINEERING_JOURNALS = [
  // Chemical Engineering
  { id: 'eng_springer_clean', name: 'Clean Technologies and Environmental Policy', abbrev: 'Clean Technol.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=10098', color: '#e9a000', category: 'Chemical Engineering' },
  { id: 'eng_springer_bioprocessbiosyst', name: 'Bioprocess and Biosystems Engineering', abbrev: 'Bioprocess Biosyst. Eng.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=449', color: '#e9a000', category: 'Chemical Engineering' },
  // Reaction Engineering
  { id: 'eng_springer_topicscatal', name: 'Topics in Catalysis', abbrev: 'Top. Catal.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=11244', color: '#e9a000', category: 'Reaction Engineering' },
  { id: 'eng_springer_kineticscatal', name: 'Kinetics and Catalysis', abbrev: 'Kinet. Catal.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=10975', color: '#e9a000', category: 'Reaction Engineering' },
  // Separations
  { id: 'eng_springer_jincluphenom', name: 'Journal of Inclusion Phenomena and Macrocyclic Chemistry', abbrev: 'J. Incl. Phenom.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=10847', color: '#e9a000', category: 'Separations' },
  // Process Modeling & Simulation
  { id: 'eng_springer_jmathchem', name: 'Journal of Mathematical Chemistry', abbrev: 'J. Math. Chem.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=10910', color: '#e9a000', category: 'Process Modeling & Simulation' },
  // Scale-up & Manufacturing Science
  { id: 'eng_springer_pharmres', name: 'Pharmaceutical Research', abbrev: 'Pharm. Res.', rss_url: 'https://link.springer.com/search.rss?facet-journal-id=11095', color: '#e9a000', category: 'Scale-up & Manufacturing Science' },
];

export const TAYLOR_ENGINEERING_JOURNALS = [
  // Chemical Engineering
  { id: 'eng_taylor_chemengcomm', name: 'Chemical Engineering Communications', abbrev: 'Chem. Eng. Commun.', rss_url: 'https://www.tandfonline.com/feed/rss/gcec20', color: '#6f42c1', category: 'Chemical Engineering' },
  { id: 'eng_taylor_chemengprocesstech', name: 'Chemical Engineering & Technology', abbrev: 'Chem. Eng. Technol.', rss_url: 'https://www.tandfonline.com/feed/rss/tcet', color: '#6f42c1', category: 'Chemical Engineering' },
  // Reaction Engineering
  { id: 'eng_taylor_intjchemreact', name: 'International Journal of Chemical Reactor Engineering', abbrev: 'Int. J. Chem. React. Eng.', rss_url: 'https://www.tandfonline.com/feed/rss/ijcr20', color: '#6f42c1', category: 'Reaction Engineering' },
  // Separations
  { id: 'eng_taylor_sepscitechnol', name: 'Separation Science and Technology', abbrev: 'Sep. Sci. Technol.', rss_url: 'https://www.tandfonline.com/feed/rss/lsst20', color: '#6f42c1', category: 'Separations' },
  { id: 'eng_taylor_jliquidchrom', name: 'Journal of Liquid Chromatography & Related Technologies', abbrev: 'J. Liq. Chromatogr.', rss_url: 'https://www.tandfonline.com/feed/rss/lchrom', color: '#6f42c1', category: 'Separations' },
  // Process Modeling & Simulation
  { id: 'eng_taylor_intjchemkinet', name: 'International Journal of Chemical Kinetics', abbrev: 'Int. J. Chem. Kinet.', rss_url: 'https://www.tandfonline.com/feed/rss/kin', color: '#6f42c1', category: 'Process Modeling & Simulation' },
  // Scale-up & Manufacturing Science
  { id: 'eng_taylor_pharmdevel', name: 'Pharmaceutical Development and Technology', abbrev: 'Pharm. Dev. Technol.', rss_url: 'https://www.tandfonline.com/feed/rss/ipdt20', color: '#6f42c1', category: 'Scale-up & Manufacturing Science' },
  { id: 'eng_taylor_drugdevind', name: 'Drug Development and Industrial Pharmacy', abbrev: 'Drug Dev. Ind. Pharm.', rss_url: 'https://www.tandfonline.com/feed/rss/iddi20', color: '#6f42c1', category: 'Scale-up & Manufacturing Science' },
];

export const ASME_ENGINEERING_JOURNALS = [
  // Chemical Engineering
  { id: 'eng_asme_jfluideng', name: 'Journal of Fluids Engineering', abbrev: 'J. Fluids Eng.', rss_url: 'https://asmedigitalcollection.asme.org/fluidsengineering/rss/site', color: '#004B87', category: 'Chemical Engineering' },
  { id: 'eng_asme_jheattransfer', name: 'Journal of Heat and Mass Transfer', abbrev: 'J. Heat Mass Transfer', rss_url: 'https://asmedigitalcollection.asme.org/heattransfer/rss/site', color: '#004B87', category: 'Chemical Engineering' },
  // Reaction Engineering
  { id: 'eng_asme_jenergres', name: 'Journal of Energy Resources Technology', abbrev: 'J. Energy Resour. Technol.', rss_url: 'https://asmedigitalcollection.asme.org/energyresources/rss/site', color: '#004B87', category: 'Reaction Engineering' },
  // Process Modeling & Simulation
  { id: 'eng_asme_jdynamsys', name: 'Journal of Dynamic Systems, Measurement, and Control', abbrev: 'J. Dyn. Syst. Meas. Control', rss_url: 'https://asmedigitalcollection.asme.org/dynamicsystems/rss/site', color: '#004B87', category: 'Process Modeling & Simulation' },
  // Scale-up & Manufacturing Science
  { id: 'eng_asme_jmanufscience', name: 'Journal of Manufacturing Science and Engineering', abbrev: 'J. Manuf. Sci. Eng.', rss_url: 'https://asmedigitalcollection.asme.org/manufacturingscience/rss/site', color: '#004B87', category: 'Scale-up & Manufacturing Science' },
  { id: 'eng_asme_jengindust', name: 'Journal of Engineering for Industry', abbrev: 'J. Eng. Ind.', rss_url: 'https://asmedigitalcollection.asme.org/manufacturingscience/rss/site', color: '#004B87', category: 'Scale-up & Manufacturing Science' },
];

export const ICHEMEE_ENGINEERING_JOURNALS = [
  // Chemical Engineering
  { id: 'eng_icheme_chemengres', name: 'Chemical Engineering Research and Design', abbrev: 'Chem. Eng. Res. Des.', rss_url: 'https://rss.sciencedirect.com/publication/science/02638762', color: '#005A9C', category: 'Chemical Engineering' },
  { id: 'eng_icheme_foodbioprodprocess', name: 'Food and Bioproducts Processing', abbrev: 'Food Bioprod. Process.', rss_url: 'https://rss.sciencedirect.com/publication/science/09603085', color: '#005A9C', category: 'Chemical Engineering' },
  // Reaction Engineering
  { id: 'eng_icheme_chemengsciadv', name: 'Chemical Engineering Science: X', abbrev: 'Chem. Eng. Sci. X', rss_url: 'https://rss.sciencedirect.com/publication/science/25900552', color: '#005A9C', category: 'Reaction Engineering' },
  // Separations
  { id: 'eng_icheme_transe', name: 'Transactions of IChemE Part E (Food)', abbrev: 'Trans. IChemE E', rss_url: 'https://rss.sciencedirect.com/publication/science/09603085', color: '#005A9C', category: 'Separations' },
  // Process Modeling & Simulation
  { id: 'eng_icheme_procpsa', name: 'Process Safety and Environmental Protection', abbrev: 'Process Saf. Environ. Prot.', rss_url: 'https://rss.sciencedirect.com/publication/science/09575820', color: '#005A9C', category: 'Process Modeling & Simulation' },
  // Scale-up & Manufacturing Science
  { id: 'eng_icheme_educhemeng', name: 'Education for Chemical Engineers', abbrev: 'Educ. Chem. Eng.', rss_url: 'https://rss.sciencedirect.com/publication/science/17497728', color: '#005A9C', category: 'Scale-up & Manufacturing Science' },
];

export const ALL_ENGINEERING_JOURNALS = [...ELSEVIER_ENGINEERING_JOURNALS, ...WILEY_ENGINEERING_JOURNALS, ...ACS_ENGINEERING_JOURNALS, ...RSC_ENGINEERING_JOURNALS, ...SPRINGER_ENGINEERING_JOURNALS, ...TAYLOR_ENGINEERING_JOURNALS, ...ASME_ENGINEERING_JOURNALS, ...ICHEMEE_ENGINEERING_JOURNALS];

export const IOP_MATERIALS_JOURNALS = [
  // Materials Science & Nanotechnology
  { id: 'mat_iop_jphysmater', name: 'Journal of Physics: Materials', abbrev: 'J. Phys.: Mater.', rss_url: 'https://iopscience.iop.org/journal/2515-7639/rss/latest', color: '#C8102E', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_iop_nanotechnology', name: 'Nanotechnology', abbrev: 'Nanotechnology', rss_url: 'https://iopscience.iop.org/journal/0957-4484/rss/latest', color: '#C8102E', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_iop_2dmater', name: '2D Materials', abbrev: '2D Mater.', rss_url: 'https://iopscience.iop.org/journal/2053-1583/rss/latest', color: '#C8102E', category: 'Materials Science & Nanotechnology' },
  { id: 'mat_iop_semiscitechnol', name: 'Semiconductor Science and Technology', abbrev: 'Semicond. Sci. Technol.', rss_url: 'https://iopscience.iop.org/journal/0268-1242/rss/latest', color: '#C8102E', category: 'Materials Science & Nanotechnology' },
  // Analytical & Measurement Science
  { id: 'mat_iop_measscitech', name: 'Measurement Science and Technology', abbrev: 'Meas. Sci. Technol.', rss_url: 'https://iopscience.iop.org/journal/0957-0233/rss/latest', color: '#C8102E', category: 'Analytical & Measurement Science' },
  { id: 'mat_iop_jphysd', name: 'Journal of Physics D: Applied Physics', abbrev: 'J. Phys. D: Appl. Phys.', rss_url: 'https://iopscience.iop.org/journal/0022-3727/rss/latest', color: '#C8102E', category: 'Analytical & Measurement Science' },
  // Sustainability & Green Chemistry
  { id: 'mat_iop_envreslett', name: 'Environmental Research Letters', abbrev: 'Environ. Res. Lett.', rss_url: 'https://iopscience.iop.org/journal/1748-9326/rss/latest', color: '#C8102E', category: 'Sustainability & Green Chemistry' },
  { id: 'mat_iop_jphysener', name: 'Journal of Physics: Energy', abbrev: 'J. Phys.: Energy', rss_url: 'https://iopscience.iop.org/journal/2515-7655/rss/latest', color: '#C8102E', category: 'Sustainability & Green Chemistry' },
  // Polymers & Soft Matter
  { id: 'mat_iop_jphyscondmat', name: 'Journal of Physics: Condensed Matter', abbrev: 'J. Phys.: Condens. Matter', rss_url: 'https://iopscience.iop.org/journal/0953-8984/rss/latest', color: '#C8102E', category: 'Polymers & Soft Matter' },
];

export const ALL_MATERIALS_JOURNALS = [...ACS_MATERIALS_JOURNALS, ...RSC_MATERIALS_JOURNALS, ...WILEY_MATERIALS_JOURNALS, ...ELSEVIER_MATERIALS_JOURNALS, ...MDPI_MATERIALS_JOURNALS, ...SPRINGER_MATERIALS_JOURNALS, ...IOP_MATERIALS_JOURNALS];

export const ALL_JOURNALS = [...ACS_JOURNALS, ...RSC_JOURNALS, ...WILEY_JOURNALS, ...ELSEVIER_JOURNALS, ...MDPI_JOURNALS, ...SPRINGER_JOURNALS, ...TAYLOR_JOURNALS, ...AAAS_JOURNALS, ...OTHER_JOURNALS, ...ALL_ENGINEERING_JOURNALS, ...ALL_MATERIALS_JOURNALS];


export default ALL_JOURNALS;