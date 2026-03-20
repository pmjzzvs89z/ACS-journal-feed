import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ─── Complete scope URL map for all journals in JournalList ────────────────────
const JOURNAL_SCOPE_URLS = {
  // ── ACS Chemistry ──────────────────────────────────────────────────────────
  'jacs':              'https://pubs.acs.org/page/jacsat/about.html',
  'chemrev':           'https://pubs.acs.org/page/chreay/about.html',
  'accounts':          'https://pubs.acs.org/page/achre4/about.html',
  'acscentsci':        'https://pubs.acs.org/page/acscii/about.html',
  'acsmacrolett':      'https://pubs.acs.org/page/amlccd/about.html',
  'acsomega':          'https://pubs.acs.org/page/acsodf/about.html',
  'acslettmater':      'https://pubs.acs.org/page/amlcef/about.html',
  'accountsmr':        'https://pubs.acs.org/page/amrcda/about.html',
  'analchem':          'https://pubs.acs.org/page/ancham/about.html',
  'acssensors':        'https://pubs.acs.org/page/ascefj/about.html',
  'acsmeasursciau':    'https://pubs.acs.org/page/amachv/about.html',
  'jproteomeres':      'https://pubs.acs.org/page/jprobs/about.html',
  'jchemeduc':         'https://pubs.acs.org/page/jceda8/about.html',
  'acschealthsaf':     'https://pubs.acs.org/page/achsc5/about.html',
  'biochem':           'https://pubs.acs.org/page/bichaw/about.html',
  'jmedchem':          'https://pubs.acs.org/page/jmcmar/about.html',
  'molpharma':         'https://pubs.acs.org/page/mpohbp/about.html',
  'acschembio':        'https://pubs.acs.org/page/acbcct/about.html',
  'acsinfectdis':      'https://pubs.acs.org/page/aidcbc/about.html',
  'bioconjchem':       'https://pubs.acs.org/page/bcches/about.html',
  'chemneuro':         'https://pubs.acs.org/page/acncdm/about.html',
  'acspharmbiotech':   'https://pubs.acs.org/page/aptsfn/about.html',
  'acsbiomater':       'https://pubs.acs.org/page/abseba/about.html',
  'acsapplbiomat':     'https://pubs.acs.org/page/aabmcb/about.html',
  'acsbiomedau':       'https://pubs.acs.org/page/abmcb8/about.html',
  'jpclett':           'https://pubs.acs.org/page/jpclcd/about.html',
  'jpca':              'https://pubs.acs.org/page/jpcafh/about.html',
  'jpcb':              'https://pubs.acs.org/page/jpcbfk/about.html',
  'jpcc':              'https://pubs.acs.org/page/jpccck/about.html',
  'jctc':              'https://pubs.acs.org/page/jctcce/about.html',
  'jcim':              'https://pubs.acs.org/page/jcisd8/about.html',
  'jpcl':              'https://pubs.acs.org/page/apcach/about.html',
  'inorgchem':         'https://pubs.acs.org/page/inocaj/about.html',
  'acsnano':           'https://pubs.acs.org/page/ancac3/about.html',
  'nanolett':          'https://pubs.acs.org/page/nalefd/about.html',
  'acsami':            'https://pubs.acs.org/page/aamick/about.html',
  'chemmater':         'https://pubs.acs.org/page/cmatex/about.html',
  'langmuir':          'https://pubs.acs.org/page/langd5/about.html',
  'crystgrowthdes':    'https://pubs.acs.org/page/cgdefu/about.html',
  'acsnanomaterials':  'https://pubs.acs.org/page/aanmf6/about.html',
  'acsapplelectrmat':  'https://pubs.acs.org/page/aaembp/about.html',
  'acsapplenergymat':  'https://pubs.acs.org/page/aaemcq/about.html',
  'acsapplengmat':     'https://pubs.acs.org/page/aaemdr/about.html',
  'acsapploptmat':     'https://pubs.acs.org/page/aaoma6/about.html',
  'macromolecules':    'https://pubs.acs.org/page/mamobx/about.html',
  'orglett':           'https://pubs.acs.org/page/orlef7/about.html',
  'joc':               'https://pubs.acs.org/page/joceah/about.html',
  'acscatal':          'https://pubs.acs.org/page/accacs/about.html',
  'orgprocess':        'https://pubs.acs.org/page/oprdfk/about.html',
  'acssynthbiol':      'https://pubs.acs.org/page/asbcd6/about.html',
  'organometallics':   'https://pubs.acs.org/page/orgnd7/about.html',
  'jnatprod':          'https://pubs.acs.org/page/jnprdf/about.html',
  'acsorgsynthau':     'https://pubs.acs.org/page/aoiab5/about.html',
  'iecr':              'https://pubs.acs.org/page/iecred/about.html',
  'acsenergylett':     'https://pubs.acs.org/page/aelccp/about.html',
  'envscitechnol':     'https://pubs.acs.org/page/esthag/about.html',
  'envscitechnollett': 'https://pubs.acs.org/page/estlcu/about.html',
  'acsapplpolym':      'https://pubs.acs.org/page/aapmcd/about.html',
  'acssustainchem':    'https://pubs.acs.org/page/ascecg/about.html',
  'acsfoodscitech':    'https://pubs.acs.org/page/afsthl/about.html',
  'acsagriscitechau':  'https://pubs.acs.org/page/aastgj/about.html',
  'acssustresourcau':  'https://pubs.acs.org/page/asrmcm/about.html',

  // ── RSC Chemistry ──────────────────────────────────────────────────────────
  'rsc_chemscience':   'https://www.rsc.org/journals-books-databases/find-an-journal/journal/SC',
  'rsc_chemcomm':      'https://www.rsc.org/journals-books-databases/find-an-journal/journal/CC',
  'rsc_chemsoc':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/CS',
  'rsc_rscchembd':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/CB',
  'rsc_newjchem':      'https://www.rsc.org/journals-books-databases/find-an-journal/journal/NJ',
  'rsc_analyst':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/AN',
  'rsc_analytmethods': 'https://www.rsc.org/journals-books-databases/find-an-journal/journal/AY',
  'rsc_jaas':          'https://www.rsc.org/journals-books-databases/find-an-journal/journal/JA',
  'rsc_labchip':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/LC',
  'rsc_sensact':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/SD',
  'rsc_medchemcomm':   'https://www.rsc.org/journals-books-databases/find-an-journal/journal/MD',
  'rsc_biomaterscience':'https://www.rsc.org/journals-books-databases/find-an-journal/journal/BM',
  'rsc_rscpharma':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/PM',
  'rsc_foodfunct':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/FO',
  'rsc_pccp':          'https://www.rsc.org/journals-books-databases/find-an-journal/journal/CP',
  'rsc_faraday':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/FD',
  'rsc_molsyst':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/ME',
  'rsc_digidisc':      'https://www.rsc.org/journals-books-databases/find-an-journal/journal/DD',
  'rsc_dalton':        'https://www.rsc.org/journals-books-databases/find-an-journal/journal/DT',
  'rsc_crystengcomm':  'https://www.rsc.org/journals-books-databases/find-an-journal/journal/CE',
  'rsc_nanoscale':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/NR',
  'rsc_nanoscaleadv':  'https://www.rsc.org/journals-books-databases/find-an-journal/journal/NA',
  'rsc_nanoscalehoriz':'https://www.rsc.org/journals-books-databases/find-an-journal/journal/NH',
  'rsc_jmaterchemc':   'https://www.rsc.org/journals-books-databases/find-an-journal/journal/TC',
  'rsc_jmaterchema':   'https://www.rsc.org/journals-books-databases/find-an-journal/journal/TA',
  'rsc_jmaterchemb':   'https://www.rsc.org/journals-books-databases/find-an-journal/journal/TB',
  'rsc_inorgchemfront':'https://www.rsc.org/journals-books-databases/find-an-journal/journal/QI',
  'rsc_materadv':      'https://www.rsc.org/journals-books-databases/find-an-journal/journal/MA',
  'rsc_materchemfront':'https://www.rsc.org/journals-books-databases/find-an-journal/journal/QM',
  'rsc_materhorizons': 'https://www.rsc.org/journals-books-databases/find-an-journal/journal/MH',
  'rsc_orgbiomolchem': 'https://www.rsc.org/journals-books-databases/find-an-journal/journal/OB',
  'rsc_natprodreports':'https://www.rsc.org/journals-books-databases/find-an-journal/journal/NP',
  'rsc_greenchem':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/GC',
  'rsc_catal':         'https://www.rsc.org/journals-books-databases/find-an-journal/journal/CY',
  'rsc_orgchemfront':  'https://www.rsc.org/journals-books-databases/find-an-journal/journal/QO',
  'rsc_rscmechano':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/MR',
  'rsc_energyenviron': 'https://www.rsc.org/journals-books-databases/find-an-journal/journal/EE',
  'rsc_rscadv':        'https://www.rsc.org/journals-books-databases/find-an-journal/journal/RA',
  'rsc_sustenergy':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/SE',
  'rsc_react_chem_eng':'https://www.rsc.org/journals-books-databases/find-an-journal/journal/RE',
  'rsc_envsciwat':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/EW',
  'rsc_envscinatno':   'https://www.rsc.org/journals-books-databases/find-an-journal/journal/EN',
  'rsc_envsciatm':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/EA',
  'rsc_envsciproc':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/EM',
  'rsc_envscienv':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/VA',
  'rsc_eesbatt':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/EB',
  'rsc_eescatal':      'https://www.rsc.org/journals-books-databases/find-an-journal/journal/EY',
  'rsc_eessolar':      'https://www.rsc.org/journals-books-databases/find-an-journal/journal/EL',
  'rsc_energyadv':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/YA',
  'rsc_indchemmat':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/IM',
  'rsc_rscsustain':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/SU',
  'rsc_polym':         'https://www.rsc.org/journals-books-databases/find-an-journal/journal/PY',
  'rsc_softmatter':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/SM',
  'rsc_rscapplpolym':  'https://www.rsc.org/journals-books-databases/find-an-journal/journal/LP',
  'rsc_rscapplinterf': 'https://www.rsc.org/journals-books-databases/find-an-journal/journal/LF',

  // ── Wiley Chemistry ────────────────────────────────────────────────────────
  'wiley_angew':          'https://onlinelibrary.wiley.com/journal/15213773',
  'wiley_chemeur':        'https://onlinelibrary.wiley.com/journal/15213765',
  'wiley_chemasia':       'https://onlinelibrary.wiley.com/journal/1861471x',
  'wiley_chempluschem':   'https://onlinelibrary.wiley.com/journal/21926506',
  'wiley_jac':            'https://onlinelibrary.wiley.com/journal/16159314',
  'wiley_electrophoresis':'https://onlinelibrary.wiley.com/journal/15222683',
  'wiley_jms':            'https://onlinelibrary.wiley.com/journal/10969888',
  'wiley_chembiochem':    'https://onlinelibrary.wiley.com/journal/14397633',
  'wiley_chemmedchem':    'https://onlinelibrary.wiley.com/journal/18607187',
  'wiley_archpharm':      'https://onlinelibrary.wiley.com/journal/15214184',
  'wiley_jpharmscience':  'https://onlinelibrary.wiley.com/journal/15206017',
  'wiley_chemphyschem':   'https://onlinelibrary.wiley.com/journal/14397641',
  'wiley_jcc':            'https://onlinelibrary.wiley.com/journal/1096987x',
  'wiley_ijqc':           'https://onlinelibrary.wiley.com/journal/1097461x',
  'wiley_ejic':           'https://onlinelibrary.wiley.com/journal/10990682',
  'wiley_advmat':         'https://onlinelibrary.wiley.com/journal/15214095',
  'wiley_advfuncmat':     'https://onlinelibrary.wiley.com/journal/16163028',
  'wiley_small':          'https://onlinelibrary.wiley.com/journal/16136829',
  'wiley_zaac':           'https://onlinelibrary.wiley.com/journal/15213749',
  'wiley_ejoc':           'https://onlinelibrary.wiley.com/journal/10990690',
  'wiley_helv':           'https://onlinelibrary.wiley.com/journal/15222675',
  'wiley_chemcat':        'https://onlinelibrary.wiley.com/journal/18673899',
  'wiley_synthesis':      'https://www.thieme-connect.com/products/ejournals/journal/10.1055/s-00000085',
  'wiley_aiche':          'https://onlinelibrary.wiley.com/journal/15475905',
  'wiley_chemsuschem':    'https://onlinelibrary.wiley.com/journal/18645631',
  'wiley_chemeng':        'https://onlinelibrary.wiley.com/journal/15214125',
  'wiley_global':         'https://onlinelibrary.wiley.com/journal/20566646',
  'wiley_macromolchem':   'https://onlinelibrary.wiley.com/journal/15213935',
  'wiley_macromolrapid':  'https://onlinelibrary.wiley.com/journal/15213927',
  'wiley_jpolymscib':     'https://onlinelibrary.wiley.com/journal/26429071',
  'wiley_polymerscience': 'https://onlinelibrary.wiley.com/journal/10970126',

  // ── Elsevier Chemistry ─────────────────────────────────────────────────────
  'elsevier_chemphyslett':   'https://www.sciencedirect.com/journal/chemical-physics-letters',
  'elsevier_poly':           'https://www.sciencedirect.com/journal/polyhedron',
  'elsevier_jmolstruct':     'https://www.sciencedirect.com/journal/journal-of-molecular-structure',
  'elsevier_talanta':        'https://www.sciencedirect.com/journal/talanta',
  'elsevier_analytica':      'https://www.sciencedirect.com/journal/analytica-chimica-acta',
  'elsevier_jchromatA':      'https://www.sciencedirect.com/journal/journal-of-chromatography-a',
  'elsevier_jchromatB':      'https://www.sciencedirect.com/journal/journal-of-chromatography-b',
  'elsevier_spectrochim':    'https://www.sciencedirect.com/journal/spectrochimica-acta-part-a-molecular-and-biomolecular-spectroscopy',
  'elsevier_microchemj':     'https://www.sciencedirect.com/journal/microchemical-journal',
  'elsevier_ejmech':         'https://www.sciencedirect.com/journal/european-journal-of-medicinal-chemistry',
  'elsevier_bioormed':       'https://www.sciencedirect.com/journal/bioorganic-and-medicinal-chemistry',
  'elsevier_bioorglett':     'https://www.sciencedirect.com/journal/bioorganic-and-medicinal-chemistry-letters',
  'elsevier_ejpb':           'https://www.sciencedirect.com/journal/european-journal-of-pharmaceutics-and-biopharmaceutics',
  'elsevier_chemphys':       'https://www.sciencedirect.com/journal/chemical-physics',
  'elsevier_compchem':       'https://www.sciencedirect.com/journal/computational-and-theoretical-chemistry',
  'elsevier_jmolspec':       'https://www.sciencedirect.com/journal/journal-of-molecular-spectroscopy',
  'elsevier_jalloy':         'https://www.sciencedirect.com/journal/journal-of-alloys-and-compounds',
  'elsevier_carbon':         'https://www.sciencedirect.com/journal/carbon',
  'elsevier_jsolstat':       'https://www.sciencedirect.com/journal/journal-of-solid-state-chemistry',
  'elsevier_matchemphys':    'https://www.sciencedirect.com/journal/materials-chemistry-and-physics',
  'elsevier_inochimacta':    'https://www.sciencedirect.com/journal/inorganica-chimica-acta',
  'elsevier_tet':            'https://www.sciencedirect.com/journal/tetrahedron',
  'elsevier_tetlett':        'https://www.sciencedirect.com/journal/tetrahedron-letters',
  'elsevier_jorgchem':       'https://www.sciencedirect.com/journal/journal-of-organometallic-chemistry',
  'elsevier_catcomm':        'https://www.sciencedirect.com/journal/catalysis-communications',
  'elsevier_chemengsci':     'https://www.sciencedirect.com/journal/chemical-engineering-science',
  'elsevier_fuel':           'https://www.sciencedirect.com/journal/fuel',
  'elsevier_applenergy':     'https://www.sciencedirect.com/journal/applied-energy',
  'elsevier_jhazmater':      'https://www.sciencedirect.com/journal/journal-of-hazardous-materials',
  'elsevier_polymer':        'https://www.sciencedirect.com/journal/polymer',
  'elsevier_eurpolymj':      'https://www.sciencedirect.com/journal/european-polymer-journal',
  'elsevier_reactfuncpolym': 'https://www.sciencedirect.com/journal/reactive-and-functional-polymers',
  'elsevier_polydeg':        'https://www.sciencedirect.com/journal/polymer-degradation-and-stability',

  // ── MDPI ───────────────────────────────────────────────────────────────────
  'mdpi_molecules':     'https://www.mdpi.com/journal/molecules/about',
  'mdpi_chemistry':     'https://www.mdpi.com/journal/chemistry/about',
  'mdpi_applsci':       'https://www.mdpi.com/journal/applsci/about',
  'mdpi_chemosensors':  'https://www.mdpi.com/journal/chemosensors/about',
  'mdpi_analytica':     'https://www.mdpi.com/journal/analytica/about',
  'mdpi_separations':   'https://www.mdpi.com/journal/separations/about',
  'mdpi_sensors':       'https://www.mdpi.com/journal/sensors/about',
  'mdpi_pharmaceutics': 'https://www.mdpi.com/journal/pharmaceutics/about',
  'mdpi_ijms':          'https://www.mdpi.com/journal/ijms/about',
  'mdpi_pharmaceuticals':'https://www.mdpi.com/journal/pharmaceuticals/about',
  'mdpi_biomolecules':  'https://www.mdpi.com/journal/biomolecules/about',
  'mdpi_marinedrugs':   'https://www.mdpi.com/journal/marinedrugs/about',
  'mdpi_physchem':      'https://www.mdpi.com/journal/physchem/about',
  'mdpi_quantumrep':    'https://www.mdpi.com/journal/quantumrep/about',
  'mdpi_materials':     'https://www.mdpi.com/journal/materials/about',
  'mdpi_nanomaterials': 'https://www.mdpi.com/journal/nanomaterials/about',
  'mdpi_inorganics':    'https://www.mdpi.com/journal/inorganics/about',
  'mdpi_crystals':      'https://www.mdpi.com/journal/crystals/about',
  'mdpi_coatings':      'https://www.mdpi.com/journal/coatings/about',
  'mdpi_organics':      'https://www.mdpi.com/journal/organics/about',
  'mdpi_reactions':     'https://www.mdpi.com/journal/reactions/about',
  'mdpi_synth':         'https://www.mdpi.com/journal/synthesis/about',
  'mdpi_catalysts':     'https://www.mdpi.com/journal/catalysts/about',
  'mdpi_sustainability':'https://www.mdpi.com/journal/sustainability/about',
  'mdpi_polymers':      'https://www.mdpi.com/journal/polymers/about',
  'mdpi_macromol':      'https://www.mdpi.com/journal/macromol/about',
  'mdpi_processes':     'https://www.mdpi.com/journal/processes/about',
  'mdpi_foods':         'https://www.mdpi.com/journal/foods/about',

  // ── Springer / Nature ──────────────────────────────────────────────────────
  'springer_natcatal':       'https://www.nature.com/natcatal',
  'springer_natchem':        'https://www.nature.com/nchem',
  'springer_natrevmater':    'https://www.nature.com/natrevmats',
  'springer_science_adv':    'https://www.nature.com/natrevchem',
  'springer_natrevchem':     'https://www.nature.com/natrevchem',
  'springer_commchem':       'https://www.nature.com/commschem',
  'springer_microchim':      'https://link.springer.com/journal/604',
  'springer_analbioanal':    'https://link.springer.com/journal/216',
  'springer_jbiolchem':      'https://link.springer.com/journal/12038',
  'springer_molbiotech':     'https://link.springer.com/journal/12033',
  'springer_pharmres':       'https://link.springer.com/journal/11095',
  'springer_theorchemacc':   'https://link.springer.com/journal/214',
  'springer_jmolmodel':      'https://link.springer.com/journal/894',
  'springer_structchem':     'https://link.springer.com/journal/11224',
  'springer_jmater':         'https://link.springer.com/journal/10853',
  'springer_transnano':      'https://link.springer.com/journal/11051',
  'springer_natnanotechnol': 'https://www.nature.com/nnano',
  'springer_natmater':       'https://www.nature.com/nmat',
  'springer_synlett':        'https://www.thieme-connect.com/products/ejournals/journal/10.1055/s-00000083',
  'springer_natsynth':       'https://www.nature.com/natsynth',
  'springer_clean':          'https://link.springer.com/journal/10098',
  'springer_natenergy':      'https://www.nature.com/nenergy',
  'springer_jpolymsci':      'https://link.springer.com/journal/10010',
  'springer_polymerbull':    'https://link.springer.com/journal/289',
  'springer_colloidpolymscience':'https://link.springer.com/journal/396',

  // ── Taylor & Francis ───────────────────────────────────────────────────────
  'taylor_molphys':         'https://www.tandfonline.com/journals/tmph20',
  'taylor_structurreports': 'https://www.tandfonline.com/journals/gcoo20',
  'taylor_analytletter':    'https://www.tandfonline.com/journals/lanl20',
  'taylor_jliquidchrom':    'https://www.tandfonline.com/journals/lchrom20',
  'taylor_applspectrosc':   'https://www.tandfonline.com/journals/lasy20',
  'taylor_jenzymeinhibmed': 'https://www.tandfonline.com/journals/ienz20',
  'taylor_drugdevind':      'https://www.tandfonline.com/journals/iddi20',
  'taylor_jrecept':         'https://www.tandfonline.com/journals/lrst20',
  'taylor_pharmdevel':      'https://www.tandfonline.com/journals/ipdt20',
  'taylor_jchemsocpak':     'https://www.tandfonline.com/journals/gcoo20',
  'taylor_intjchemkinet':   'https://www.tandfonline.com/journals/kin20',
  'taylor_phasettrans':     'https://www.tandfonline.com/journals/gpht20',
  'taylor_jdispsci':        'https://www.tandfonline.com/journals/ldis20',
  'taylor_matletters':      'https://www.tandfonline.com/journals/ymlt20',
  'taylor_synthcomm':       'https://www.tandfonline.com/journals/lsyc20',
  'taylor_natprod':         'https://www.tandfonline.com/journals/gnpl20',
  'taylor_jsulfur':         'https://www.tandfonline.com/journals/gpss20',
  'taylor_chemengcomm':     'https://www.tandfonline.com/journals/gcec20',
  'taylor_jenvsciheal':     'https://www.tandfonline.com/journals/lesa20',
  'taylor_polymer':         'https://www.tandfonline.com/journals/lmsc20',
  'taylor_jmacromolscib':   'https://www.tandfonline.com/journals/lmsb20',
  'taylor_jmacromolscia':   'https://www.tandfonline.com/journals/lmsa20',

  // ── AAAS ───────────────────────────────────────────────────────────────────
  'aaas_science':        'https://www.science.org/journal/science',
  'aaas_sciadv':         'https://www.science.org/journal/sciadv',
  'aaas_scisignal':      'https://www.science.org/journal/signaling',
  'aaas_sciimmunol':     'https://www.science.org/journal/sciimmunol',
  'aaas_scirobot':       'https://www.science.org/journal/scirobotics',
  'aaas_scitranslmed':   'https://www.science.org/journal/stm',
  'aaas_scienceabc':     'https://www.science.org/journal/science',
  'aaas_sciadv_mater':   'https://www.science.org/journal/sciadv',
  'aaas_scienceaas':     'https://www.science.org/journal/science',

  // ── Engineering – Elsevier ─────────────────────────────────────────────────
  'eng_elsevier_chemengsci':      'https://www.sciencedirect.com/journal/chemical-engineering-science',
  'eng_elsevier_chemengj':        'https://www.sciencedirect.com/journal/chemical-engineering-journal',
  'eng_elsevier_aiche':           'https://www.sciencedirect.com/journal/chemical-engineering-research-and-design',
  'eng_elsevier_chemengscicomm':  'https://www.sciencedirect.com/journal/chemical-engineering-communications',
  'eng_elsevier_proceng':         'https://www.sciencedirect.com/journal/procedia-engineering',
  'eng_elsevier_cattoday':        'https://www.sciencedirect.com/journal/catalysis-today',
  'eng_elsevier_chemengprocess':  'https://www.sciencedirect.com/journal/chemical-engineering-and-processing-process-intensification',
  'eng_elsevier_reactkineticsmechcat':'https://www.sciencedirect.com/journal/reaction-kinetics-mechanisms-and-catalysis',
  'eng_elsevier_seppur':          'https://www.sciencedirect.com/journal/separation-and-purification-technology',
  'eng_elsevier_fluidphaseequilib':'https://www.sciencedirect.com/journal/fluid-phase-equilibria',
  'eng_elsevier_jmembrsci':       'https://www.sciencedirect.com/journal/journal-of-membrane-science',
  'eng_elsevier_jchromatagrap':   'https://www.sciencedirect.com/journal/journal-of-chromatography-a',
  'eng_elsevier_compchemeng':     'https://www.sciencedirect.com/journal/computers-and-chemical-engineering',
  'eng_elsevier_chemengjour_b':   'https://www.sciencedirect.com/journal/chemical-engineering-and-technology',
  'eng_elsevier_intjpharm':       'https://www.sciencedirect.com/journal/international-journal-of-pharmaceutics',
  'eng_elsevier_orgprocess':      'https://www.sciencedirect.com/journal/organic-process-research-and-development',

  // ── Engineering – Wiley ────────────────────────────────────────────────────
  'eng_wiley_aiche':              'https://onlinelibrary.wiley.com/journal/15475905',
  'eng_wiley_chemeng':            'https://onlinelibrary.wiley.com/journal/15214125',
  'eng_wiley_canchemeng':         'https://onlinelibrary.wiley.com/journal/1939019x',
  'eng_wiley_intjchemkinet':      'https://onlinelibrary.wiley.com/journal/10974601',
  'eng_wiley_chemcat':            'https://onlinelibrary.wiley.com/journal/18673899',
  'eng_wiley_jsepsci':            'https://onlinelibrary.wiley.com/journal/16159314',
  'eng_wiley_electrophoresis':    'https://onlinelibrary.wiley.com/journal/15222683',
  'eng_wiley_jchemtechnolbiotechnol':'https://onlinelibrary.wiley.com/journal/10974660',
  'eng_wiley_jpharmscience':      'https://onlinelibrary.wiley.com/journal/15206017',

  // ── Engineering – ACS ─────────────────────────────────────────────────────
  'eng_acs_iecr':       'https://pubs.acs.org/page/iecred/about.html',
  'eng_acs_acseng':     'https://pubs.acs.org/page/aeacb3/about.html',
  'eng_acs_acscatal':   'https://pubs.acs.org/page/accacs/about.html',
  'eng_acs_orgprocess': 'https://pubs.acs.org/page/oprdfk/about.html',
  'eng_acs_langmuireng':'https://pubs.acs.org/page/langd5/about.html',
  'eng_acs_envscitechnol':'https://pubs.acs.org/page/esthag/about.html',
  'eng_acs_jctc':       'https://pubs.acs.org/page/jctcce/about.html',
  'eng_acs_molpharm':   'https://pubs.acs.org/page/mpohbp/about.html',

  // ── Engineering – RSC ─────────────────────────────────────────────────────
  'eng_rsc_reactchemeng': 'https://www.rsc.org/journals-books-databases/find-an-journal/journal/RE',
  'eng_rsc_indchemmat':   'https://www.rsc.org/journals-books-databases/find-an-journal/journal/IM',
  'eng_rsc_catalscitechnol':'https://www.rsc.org/journals-books-databases/find-an-journal/journal/CY',
  'eng_rsc_greenchem':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/GC',
  'eng_rsc_labchip':      'https://www.rsc.org/journals-books-databases/find-an-journal/journal/LC',
  'eng_rsc_envsciwat':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/EW',
  'eng_rsc_molsysdes':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/ME',
  'eng_rsc_digidisc':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/DD',
  'eng_rsc_rscadv':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/RA',

  // ── Engineering – Springer ────────────────────────────────────────────────
  'eng_springer_clean':           'https://link.springer.com/journal/10098',
  'eng_springer_bioprocessbiosyst':'https://link.springer.com/journal/449',
  'eng_springer_topicscatal':     'https://link.springer.com/journal/11244',
  'eng_springer_kineticscatal':   'https://link.springer.com/journal/10975',
  'eng_springer_jincluphenom':    'https://link.springer.com/journal/10847',
  'eng_springer_jmathchem':       'https://link.springer.com/journal/10910',
  'eng_springer_pharmres':        'https://link.springer.com/journal/11095',

  // ── Engineering – Taylor ──────────────────────────────────────────────────
  'eng_taylor_chemengcomm':       'https://www.tandfonline.com/journals/gcec20',
  'eng_taylor_chemengprocesstech':'https://www.tandfonline.com/journals/tcet20',
  'eng_taylor_intjchemreact':     'https://www.tandfonline.com/journals/ijcr20',
  'eng_taylor_sepscitechnol':     'https://www.tandfonline.com/journals/lsst20',
  'eng_taylor_jliquidchrom':      'https://www.tandfonline.com/journals/lchrom20',
  'eng_taylor_intjchemkinet':     'https://www.tandfonline.com/journals/kin20',
  'eng_taylor_pharmdevel':        'https://www.tandfonline.com/journals/ipdt20',
  'eng_taylor_drugdevind':        'https://www.tandfonline.com/journals/iddi20',

  // ── Engineering – ASME ────────────────────────────────────────────────────
  'eng_asme_jfluideng':    'https://asmedigitalcollection.asme.org/fluidsengineering',
  'eng_asme_jheattransfer':'https://asmedigitalcollection.asme.org/heattransfer',
  'eng_asme_jenergres':    'https://asmedigitalcollection.asme.org/energyresources',
  'eng_asme_jdynamsys':    'https://asmedigitalcollection.asme.org/dynamicsystems',
  'eng_asme_jmanufscience':'https://asmedigitalcollection.asme.org/manufacturingscience',
  'eng_asme_jengindust':   'https://asmedigitalcollection.asme.org/manufacturingscience',

  // ── Engineering – IChemE ──────────────────────────────────────────────────
  'eng_icheme_chemengres':       'https://www.sciencedirect.com/journal/chemical-engineering-research-and-design',
  'eng_icheme_foodbioprodprocess':'https://www.sciencedirect.com/journal/food-and-bioproducts-processing',
  'eng_icheme_chemengsciadv':    'https://www.sciencedirect.com/journal/chemical-engineering-science-x',
  'eng_icheme_transe':           'https://www.sciencedirect.com/journal/food-and-bioproducts-processing',
  'eng_icheme_procpsa':          'https://www.sciencedirect.com/journal/process-safety-and-environmental-protection',
  'eng_icheme_educhemeng':       'https://www.sciencedirect.com/journal/education-for-chemical-engineers',

  // ── Materials – ACS (mat_ prefixed) ───────────────────────────────────────
  'mat_acs_acsnano':          'https://pubs.acs.org/page/ancac3/about.html',
  'mat_acs_nanolett':         'https://pubs.acs.org/page/nalefd/about.html',
  'mat_acs_acsami':           'https://pubs.acs.org/page/aamick/about.html',
  'mat_acs_chemmater':        'https://pubs.acs.org/page/cmatex/about.html',
  'mat_acs_acsnanomaterials': 'https://pubs.acs.org/page/aanmf6/about.html',
  'mat_acs_acsapplenergymat': 'https://pubs.acs.org/page/aaemcq/about.html',
  'mat_acs_acsapplelectrmat': 'https://pubs.acs.org/page/aaembp/about.html',
  'mat_acs_acsapploptmat':    'https://pubs.acs.org/page/aaoma6/about.html',
  'mat_acs_acsmaterlett':     'https://pubs.acs.org/page/amlcef/about.html',
  'mat_acs_langmuir':         'https://pubs.acs.org/page/langd5/about.html',
  'mat_acs_analchem':         'https://pubs.acs.org/page/ancham/about.html',
  'mat_acs_acssensors':       'https://pubs.acs.org/page/ascefj/about.html',
  'mat_acs_acsmeasursciau':   'https://pubs.acs.org/page/amachv/about.html',
  'mat_acs_jproteomeres':     'https://pubs.acs.org/page/jprobs/about.html',
  'mat_acs_acssustainchem':   'https://pubs.acs.org/page/ascecg/about.html',
  'mat_acs_envscitechnol':    'https://pubs.acs.org/page/esthag/about.html',
  'mat_acs_acsenergylett':    'https://pubs.acs.org/page/aelccp/about.html',
  'mat_acs_acssustresourcau': 'https://pubs.acs.org/page/asrmcm/about.html',
  'mat_acs_acsbiomater':      'https://pubs.acs.org/page/abseba/about.html',
  'mat_acs_acsapplbiomat':    'https://pubs.acs.org/page/aabmcb/about.html',
  'mat_acs_macromolecules':   'https://pubs.acs.org/page/mamobx/about.html',
  'mat_acs_acsapplpolym':     'https://pubs.acs.org/page/aapmcd/about.html',
  'mat_acs_acsmacrolett':     'https://pubs.acs.org/page/amlccd/about.html',

  // ── Materials – RSC ────────────────────────────────────────────────────────
  'mat_rsc_nanoscale':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/NR',
  'mat_rsc_nanoscaleadv':  'https://www.rsc.org/journals-books-databases/find-an-journal/journal/NA',
  'mat_rsc_nanoscalehoriz':'https://www.rsc.org/journals-books-databases/find-an-journal/journal/NH',
  'mat_rsc_jmaterchema':   'https://www.rsc.org/journals-books-databases/find-an-journal/journal/TA',
  'mat_rsc_jmaterchemb':   'https://www.rsc.org/journals-books-databases/find-an-journal/journal/TB',
  'mat_rsc_jmaterchemc':   'https://www.rsc.org/journals-books-databases/find-an-journal/journal/TC',
  'mat_rsc_materadv':      'https://www.rsc.org/journals-books-databases/find-an-journal/journal/MA',
  'mat_rsc_materhorizons': 'https://www.rsc.org/journals-books-databases/find-an-journal/journal/MH',
  'mat_rsc_analyst':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/AN',
  'mat_rsc_analytmethods': 'https://www.rsc.org/journals-books-databases/find-an-journal/journal/AY',
  'mat_rsc_jaas':          'https://www.rsc.org/journals-books-databases/find-an-journal/journal/JA',
  'mat_rsc_labchip':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/LC',
  'mat_rsc_sensact':       'https://www.rsc.org/journals-books-databases/find-an-journal/journal/SD',
  'mat_rsc_greenchem':     'https://www.rsc.org/journals-books-databases/find-an-journal/journal/GC',
  'mat_rsc_energyenviron': 'https://www.rsc.org/journals-books-databases/find-an-journal/journal/EE',
  'mat_rsc_sustenergy':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/SE',
  'mat_rsc_rscsustain':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/SU',
  'mat_rsc_polym':         'https://www.rsc.org/journals-books-databases/find-an-journal/journal/PY',
  'mat_rsc_softmatter':    'https://www.rsc.org/journals-books-databases/find-an-journal/journal/SM',

  // ── Materials – Wiley ─────────────────────────────────────────────────────
  'mat_wiley_advmat':        'https://onlinelibrary.wiley.com/journal/15214095',
  'mat_wiley_advfuncmat':    'https://onlinelibrary.wiley.com/journal/16163028',
  'mat_wiley_small':         'https://onlinelibrary.wiley.com/journal/16136829',
  'mat_wiley_jms':           'https://onlinelibrary.wiley.com/journal/10969888',
  'mat_wiley_electrophoresis':'https://onlinelibrary.wiley.com/journal/15222683',
  'mat_wiley_chemsuschem':   'https://onlinelibrary.wiley.com/journal/18645631',
  'mat_wiley_macromolchem':  'https://onlinelibrary.wiley.com/journal/15213935',
  'mat_wiley_macromolrapid': 'https://onlinelibrary.wiley.com/journal/15213927',
  'mat_wiley_jpolymscib':    'https://onlinelibrary.wiley.com/journal/26429071',

  // ── Materials – Elsevier ──────────────────────────────────────────────────
  'mat_elsevier_jalloy':     'https://www.sciencedirect.com/journal/journal-of-alloys-and-compounds',
  'mat_elsevier_carbon':     'https://www.sciencedirect.com/journal/carbon',
  'mat_elsevier_matchemphys':'https://www.sciencedirect.com/journal/materials-chemistry-and-physics',
  'mat_elsevier_talanta':    'https://www.sciencedirect.com/journal/talanta',
  'mat_elsevier_analytica':  'https://www.sciencedirect.com/journal/analytica-chimica-acta',
  'mat_elsevier_spectrochim':'https://www.sciencedirect.com/journal/spectrochimica-acta-part-a-molecular-and-biomolecular-spectroscopy',
  'mat_elsevier_microchemj': 'https://www.sciencedirect.com/journal/microchemical-journal',
  'mat_elsevier_jchromatA':  'https://www.sciencedirect.com/journal/journal-of-chromatography-a',
  'mat_elsevier_jhazmater':  'https://www.sciencedirect.com/journal/journal-of-hazardous-materials',
  'mat_elsevier_applenergy': 'https://www.sciencedirect.com/journal/applied-energy',
  'mat_elsevier_fuel':       'https://www.sciencedirect.com/journal/fuel',
  'mat_elsevier_polymer':    'https://www.sciencedirect.com/journal/polymer',
  'mat_elsevier_eurpolymj':  'https://www.sciencedirect.com/journal/european-polymer-journal',

  // ── Materials – MDPI ──────────────────────────────────────────────────────
  'mat_mdpi_materials':     'https://www.mdpi.com/journal/materials/about',
  'mat_mdpi_nanomaterials': 'https://www.mdpi.com/journal/nanomaterials/about',
  'mat_mdpi_coatings':      'https://www.mdpi.com/journal/coatings/about',
  'mat_mdpi_crystals':      'https://www.mdpi.com/journal/crystals/about',
  'mat_mdpi_chemosensors':  'https://www.mdpi.com/journal/chemosensors/about',
  'mat_mdpi_sensors':       'https://www.mdpi.com/journal/sensors/about',
  'mat_mdpi_analytica':     'https://www.mdpi.com/journal/analytica/about',
  'mat_mdpi_sustainability':'https://www.mdpi.com/journal/sustainability/about',
  'mat_mdpi_catalysts':     'https://www.mdpi.com/journal/catalysts/about',
  'mat_mdpi_polymers':      'https://www.mdpi.com/journal/polymers/about',
  'mat_mdpi_macromol':      'https://www.mdpi.com/journal/macromol/about',

  // ── Materials – Springer ──────────────────────────────────────────────────
  'mat_springer_jmater':        'https://link.springer.com/journal/10853',
  'mat_springer_transnano':     'https://link.springer.com/journal/11051',
  'mat_springer_natnanotechnol':'https://www.nature.com/nnano',
  'mat_springer_natmater':      'https://www.nature.com/nmat',
  'mat_springer_natrevmater':   'https://www.nature.com/natrevmats',
  'mat_springer_microchim':     'https://link.springer.com/journal/604',
  'mat_springer_analbioanal':   'https://link.springer.com/journal/216',
  'mat_springer_natenergy':     'https://www.nature.com/nenergy',
  'mat_springer_clean':         'https://link.springer.com/journal/10098',
  'mat_springer_jpolymsci':     'https://link.springer.com/journal/10010',
  'mat_springer_polymerbull':   'https://link.springer.com/journal/289',

  // ── Materials – IOP ───────────────────────────────────────────────────────
  'mat_iop_jphysmater':    'https://iopscience.iop.org/journal/2515-7639',
  'mat_iop_nanotechnology':'https://iopscience.iop.org/journal/0957-4484',
  'mat_iop_2dmater':       'https://iopscience.iop.org/journal/2053-1583',
  'mat_iop_semiscitechnol':'https://iopscience.iop.org/journal/0268-1242',
  'mat_iop_measscitech':   'https://iopscience.iop.org/journal/0957-0233',
  'mat_iop_jphysd':        'https://iopscience.iop.org/journal/0022-3727',
  'mat_iop_envreslett':    'https://iopscience.iop.org/journal/1748-9326',
  'mat_iop_jphysener':     'https://iopscience.iop.org/journal/2515-7655',
  'mat_iop_jphyscondmat':  'https://iopscience.iop.org/journal/0953-8984',
};

// Journal name lookup (for labeling DB records correctly)
const JOURNAL_NAMES = {
  'jacs': 'Journal of the American Chemical Society', 'chemrev': 'Chemical Reviews',
  'accounts': 'Accounts of Chemical Research', 'acscentsci': 'ACS Central Science',
  'acsmacrolett': 'ACS Macro Letters', 'acsomega': 'ACS Omega',
  'acslettmater': 'ACS Materials Letters', 'accountsmr': 'Accounts of Materials Research',
  'analchem': 'Analytical Chemistry', 'acssensors': 'ACS Sensors',
  'acsmeasursciau': 'ACS Measurement Science Au', 'jproteomeres': 'Journal of Proteome Research',
  'jchemeduc': 'Journal of Chemical Education', 'acschealthsaf': 'ACS Chemical Health & Safety',
  'biochem': 'Biochemistry', 'jmedchem': 'Journal of Medicinal Chemistry',
  'molpharma': 'Molecular Pharmaceutics', 'acschembio': 'ACS Chemical Biology',
  'acsinfectdis': 'ACS Infectious Diseases', 'bioconjchem': 'Bioconjugate Chemistry',
  'chemneuro': 'ACS Chemical Neuroscience', 'acspharmbiotech': 'ACS Pharmacology & Translational Science',
  'acsbiomater': 'ACS Biomaterials Science & Engineering', 'acsapplbiomat': 'ACS Applied Bio Materials',
  'acsbiomedau': 'ACS Bio & Med Chem Au', 'jpclett': 'Journal of Physical Chemistry Letters',
  'jpca': 'Journal of Physical Chemistry A', 'jpcb': 'Journal of Physical Chemistry B',
  'jpcc': 'Journal of Physical Chemistry C', 'jctc': 'Journal of Chemical Theory and Computation',
  'jcim': 'Journal of Chemical Information and Modeling', 'jpcl': 'ACS Physical Chemistry Au',
  'inorgchem': 'Inorganic Chemistry', 'acsnano': 'ACS Nano', 'nanolett': 'Nano Letters',
  'acsami': 'ACS Applied Materials & Interfaces', 'chemmater': 'Chemistry of Materials',
  'langmuir': 'Langmuir', 'crystgrowthdes': 'Crystal Growth & Design',
  'acsnanomaterials': 'ACS Applied Nano Materials', 'acsapplelectrmat': 'ACS Applied Electronic Materials',
  'acsapplenergymat': 'ACS Applied Energy Materials', 'acsapplengmat': 'ACS Applied Engineering Materials',
  'acsapploptmat': 'ACS Applied Optical Materials', 'macromolecules': 'Macromolecules',
  'orglett': 'Organic Letters', 'joc': 'Journal of Organic Chemistry', 'acscatal': 'ACS Catalysis',
  'orgprocess': 'Organic Process Research & Development', 'acssynthbiol': 'ACS Synthetic Biology',
  'organometallics': 'Organometallics', 'jnatprod': 'Journal of Natural Products',
  'acsorgsynthau': 'ACS Organic & Inorganic Au', 'iecr': 'Industrial & Engineering Chemistry Research',
  'acsenergylett': 'ACS Energy Letters', 'envscitechnol': 'Environmental Science & Technology',
  'envscitechnollett': 'Environmental Science & Technology Letters',
  'acsapplpolym': 'ACS Applied Polymer Materials', 'acssustainchem': 'ACS Sustainable Chemistry & Engineering',
  'acsfoodscitech': 'ACS Food Science & Technology', 'acsagriscitechau': 'ACS Agricultural Science & Technology',
  'acssustresourcau': 'ACS Sustainable Resource Management',
  'rsc_chemscience': 'Chemical Science', 'rsc_chemcomm': 'Chemical Communications',
  'rsc_chemsoc': 'Chemical Society Reviews', 'rsc_rscchembd': 'RSC Chemical Biology',
  'rsc_newjchem': 'New Journal of Chemistry', 'rsc_analyst': 'Analyst',
  'rsc_analytmethods': 'Analytical Methods', 'rsc_jaas': 'Journal of Analytical Atomic Spectrometry',
  'rsc_labchip': 'Lab on a Chip', 'rsc_sensact': 'Sensors & Diagnostics',
  'rsc_medchemcomm': 'RSC Medicinal Chemistry', 'rsc_biomaterscience': 'Biomaterials Science',
  'rsc_rscpharma': 'RSC Pharmaceutics', 'rsc_foodfunct': 'Food & Function',
  'rsc_pccp': 'Physical Chemistry Chemical Physics', 'rsc_faraday': 'Faraday Discussions',
  'rsc_molsyst': 'Molecular Systems Design & Engineering', 'rsc_digidisc': 'Digital Discovery',
  'rsc_dalton': 'Dalton Transactions', 'rsc_crystengcomm': 'CrystEngComm',
  'rsc_nanoscale': 'Nanoscale', 'rsc_nanoscaleadv': 'Nanoscale Advances',
  'rsc_nanoscalehoriz': 'Nanoscale Horizons', 'rsc_jmaterchemc': 'Journal of Materials Chemistry C',
  'rsc_jmaterchema': 'Journal of Materials Chemistry A', 'rsc_jmaterchemb': 'Journal of Materials Chemistry B',
  'rsc_inorgchemfront': 'Inorganic Chemistry Frontiers', 'rsc_materadv': 'Materials Advances',
  'rsc_materchemfront': 'Materials Chemistry Frontiers', 'rsc_materhorizons': 'Materials Horizons',
  'rsc_orgbiomolchem': 'Organic & Biomolecular Chemistry', 'rsc_natprodreports': 'Natural Product Reports',
  'rsc_greenchem': 'Green Chemistry', 'rsc_catal': 'Catalysis Science & Technology',
  'rsc_orgchemfront': 'Organic Chemistry Frontiers', 'rsc_rscmechano': 'RSC Mechanochemistry',
  'rsc_energyenviron': 'Energy & Environmental Science', 'rsc_rscadv': 'RSC Advances',
  'rsc_sustenergy': 'Sustainable Energy & Fuels', 'rsc_react_chem_eng': 'Reaction Chemistry & Engineering',
  'rsc_envsciwat': 'Environmental Science: Water Research & Technology',
  'rsc_envscinatno': 'Environmental Science: Nano', 'rsc_envsciatm': 'Environmental Science: Atmospheres',
  'rsc_envsciproc': 'Environmental Science: Processes & Impacts', 'rsc_envscienv': 'Environmental Science: Advances',
  'rsc_eesbatt': 'EES Batteries', 'rsc_eescatal': 'EES Catalysis', 'rsc_eessolar': 'EES Solar',
  'rsc_energyadv': 'Energy Advances', 'rsc_indchemmat': 'Industrial Chemistry & Materials',
  'rsc_rscsustain': 'RSC Sustainability', 'rsc_polym': 'Polymer Chemistry',
  'rsc_softmatter': 'Soft Matter', 'rsc_rscapplpolym': 'RSC Applied Polymers',
  'rsc_rscapplinterf': 'RSC Applied Interfaces',
};

async function fetchPageText(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    if (!res.ok) return '';
    const html = await res.text();
    // Strip HTML, collapse whitespace, take first 5000 chars
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 5000);
  } catch {
    return '';
  }
}

async function fetchScopeKeywords(base44, journalId, journalName, scopeUrl) {
  const pageText = await fetchPageText(scopeUrl);

  const prompt = `You are a highly discerning scientific literature expert, focusing on granular detail. Extract a comprehensive list of SPECIFIC scope keywords for the journal "${journalName}".

${pageText ? `Web page content from ${scopeUrl}:\n${pageText}\n\n` : ''}

Generate 25-50 precise keywords covering:
- Core research topics (e.g., "organometallic catalysis", "drug discovery methods", "surface functionalization for biosensors")
- Methods and techniques (e.g., "quantitative NMR spectroscopy", "UHPLC-MS/MS", "time-dependent density functional theory", "single-cell mass spectrometry")
- Highly specific sub-fields and application areas (e.g., "reaction mechanism elucidation", "polymer synthesis via living polymerization", "environmental toxicology of microplastics", "biomarker detection for neurodegenerative diseases")
- Material types or compound classes covered (e.g., "metal-organic frameworks for gas storage", "upconverting nanoparticles", "biodegradable polymers", "heterocyclic compound synthesis")

Be EXTREMELY specific. Avoid overly broad single-word terms. If a broad field like 'toxicology' is relevant, always qualify it with a sub-discipline (e.g., 'neurotoxicology', 'pharmacotoxicology', 'environmental toxicology'). Use multi-word, researcher-level terminology as found in specialized databases.

Return ONLY: {"keywords": ["keyword1", "keyword2", ...], "summary": "one sentence precise scope summary"}`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        keywords: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  });

  return result;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  // Optional: pass specific journal_ids array to process only those; omit for all
  const { journal_ids, skip_existing = true } = body;

  const idsToProcess = journal_ids || Object.keys(JOURNAL_SCOPE_URLS);

  // Fetch all existing scopes once
  const existingScopes = await base44.asServiceRole.entities.JournalScope.list('-created_date', 500);
  const existingMap = {};
  existingScopes.forEach(s => { existingMap[s.journal_id] = s; });

  const results = [];
  const skipped = [];
  const errors = [];

  // Only process up to `batch_size` journals per call to avoid timeouts
  const batchSize = body.batch_size || 10;
  const offset = body.offset || 0;
  const batch = idsToProcess.slice(offset, offset + batchSize);

  for (const journalId of batch) {
    const scopeUrl = JOURNAL_SCOPE_URLS[journalId];
    if (!scopeUrl) continue;

    // Skip if already has keywords and skip_existing is true
    const existing = existingMap[journalId];
    if (skip_existing && existing && existing.keywords && existing.keywords.length > 5) {
      skipped.push(journalId);
      continue;
    }

    const journalName = JOURNAL_NAMES[journalId] || journalId;

    try {
      const scopeData = await fetchScopeKeywords(base44, journalId, journalName, scopeUrl);
      const keywords = scopeData.keywords || [];
      const summary = scopeData.summary || '';

      if (existing) {
        await base44.asServiceRole.entities.JournalScope.update(existing.id, { keywords, scope_summary: summary });
      } else {
        await base44.asServiceRole.entities.JournalScope.create({
          journal_id: journalId,
          journal_name: journalName,
          keywords,
          scope_summary: summary
        });
      }

      results.push({ journalId, journalName, keywordCount: keywords.length });
    } catch (err) {
      errors.push({ journalId, error: err.message });
    }

    // Delay between LLM calls to respect rate limits
    await new Promise(r => setTimeout(r, 1500));
  }

  const nextOffset = offset + batchSize;
  const hasMore = nextOffset < idsToProcess.length;

  return Response.json({
    processed: results.length,
    skipped: skipped.length,
    errors: errors.length,
    batch_total: batch.length,
    offset,
    next_offset: hasMore ? nextOffset : null,
    has_more: hasMore,
    total_journals: idsToProcess.length,
    results,
    error_details: errors
  });
});